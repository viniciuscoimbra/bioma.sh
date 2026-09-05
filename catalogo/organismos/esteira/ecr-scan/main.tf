# Organismo ecr-scan (15·D3): registro de imagem com verificação contínua.
# Deploy referencia imagem por digest, nunca por tag mutável.

# aws:SourceOrgID não reflete a condição real: nenhuma policy de serviço
# amarra o pull por Organization inteira — o que autoriza é a própria função
# Lambda que faz o pull, identificada pelo ARN dela (aws:SourceArn), em
# qualquer conta da região onde o compute existe (dev/hml/prd, cada uma sua
# conta). Sem `data.aws_region`, a região ficaria hardcoded e divergiria do
# provider se o organismo for reaplicado em outra região.
data "aws_region" "esta" {}

resource "aws_ecr_repository" "repo" {
  for_each = toset(var.repos)

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = var.kms_key_arn
  }
}

# A Lambda por imagem, nas contas de domínio, puxa daqui como SERVIÇO — não é
# um principal da Organization, então aws:PrincipalOrgID não a alcança.
# aws:SourceOrgID também não serve: nenhuma condição de serviço amarra o pull
# à Organization como um todo, então essa condição nunca era satisfeita, e o
# CreateFunction cross-account reprovava com AccessDenied no acesso à imagem
# mesmo com a policy aplicada. aws:SourceArn com StringLike prende o pull à
# própria função Lambda que invoca (qualquer conta, região fixa), que é a
# condição que a AWS de fato avalia nesse cenário.
resource "aws_ecr_repository_policy" "pull_da_lambda" {
  for_each = aws_ecr_repository.repo

  repository = each.value.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # quem cria a função valida o acesso à imagem com a própria credencial,
      # antes de o serviço assumir o pull — as duas pernas são obrigatórias
      # no desenho cross-account documentado pela AWS
      {
        Sid       = "PullDeQuemCriaNaOrganization"
        Effect    = "Allow"
        Principal = { AWS = "*" }
        Action    = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Condition = { StringEquals = { "aws:PrincipalOrgID" = var.org_id } }
      },
      {
        Sid       = "PullDaLambdaDaOrganization"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Condition = { StringLike = { "aws:SourceArn" = "arn:aws:lambda:${data.aws_region.esta.region}:*:function:*" } }
      }
    ]
  })
}

resource "aws_ecr_registry_scanning_configuration" "continuo" {
  scan_type = "ENHANCED" # Inspector: CVE contínuo em imagem e dependência

  rule {
    scan_frequency = "CONTINUOUS_SCAN"
    repository_filter {
      filter      = "*"
      filter_type = "WILDCARD"
    }
  }
}

# Duas regras, e a ORDEM é o que protege o placeholder. No ECR cada imagem é
# avaliada pela primeira regra que casa com ela e sai do alcance das seguintes:
# a de prefixo vem antes justamente para que a de contagem não alcance quem ela
# já cobriu.
#
# Sem isto o placeholder expira como qualquer build, e a falha é surda: o digest
# some do registro, nada quebra enquanto a função existe (`image_uri` está em
# `ignore_changes` na molécula funcao-processadora, então nem o plano acusa), e a
# conta chega no dia em que alguém cria a função de um serviço novo, com um
# `CreateFunction` que reclama de imagem inexistente e não fala em lifecycle.
# Medido numa instalação real em 2026-09-01: registro com 67 imagens e teto de
# 50, com o bootstrap de todo serviço novo apontando para o mesmo digest.
resource "aws_ecr_lifecycle_policy" "limpeza" {
  for_each = aws_ecr_repository.repo

  repository = each.value.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "guarda os placeholders de bootstrap, que não são build de ninguém"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["placeholder-"]
          countType     = "imageCountMoreThan"
          countNumber   = var.placeholders_retidos
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "mantém as últimas ${var.imagens_retidas} imagens"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.imagens_retidas
        }
        action = { type = "expire" }
      },
    ]
  })
}

# A REPLICAÇÃO PARA A REGIÃO DA NÃO-PRODUÇÃO, e ela existe por um limite da
# AWS que não aparece no plano: Lambda por imagem exige a imagem num ECR da
# MESMA região da função. Com o registro só em São Paulo, toda função de dev e
# de homologação em Virgínia morre no CreateFunction, com erro que fala de
# imagem inacessível e não de região. Medido em 2026-09-05.
#
# A replicação é do REGISTRO (uma por conta e região de origem), copia por
# digest, e só alcança o que for enviado DEPOIS de existir: as imagens já
# publicadas precisam de uma cópia à mão, uma vez. Os repositórios de destino
# nascem pela célula irmã na outra região (`esteira/nprd/ecr-scan`), com a
# mesma política, porque a replicação copia imagem e não política.
resource "aws_ecr_replication_configuration" "para_outra_regiao" {
  count = length(var.replicar_para) == 0 ? 0 : 1

  replication_configuration {
    rule {
      dynamic "destination" {
        for_each = var.replicar_para
        content {
          region      = destination.value.regiao
          registry_id = destination.value.conta
        }
      }
    }
  }
}

data "aws_caller_identity" "esta" {}

# A POLÍTICA DO REGISTRO DE DESTINO, para a replicação entre CONTAS. A conta é
# decidida pelo caminho da célula: `esteira/nprd` vive na conta de devsecops de
# não-produção, e a de origem na de produção. Replicar de uma conta para outra
# exige que o destino autorize `ecr:ReplicateImage` para a origem, e sem isso a
# replicação falha em silêncio: a origem não recebe erro, e o destino nunca
# recebe imagem. Quem recebe declara de quem aceita em `aceita_replicacao_de`.
resource "aws_ecr_registry_policy" "aceita_replicacao" {
  count = length(var.aceita_replicacao_de) == 0 ? 0 : 1

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "ReplicacaoDaOrigem"
      Effect    = "Allow"
      Principal = { AWS = [for c in var.aceita_replicacao_de : "arn:aws:iam::${c}:root"] }
      Action    = ["ecr:CreateRepository", "ecr:ReplicateImage"]
      Resource  = "arn:aws:ecr:${data.aws_region.esta.region}:${data.aws_caller_identity.esta.account_id}:repository/*"
    }]
  })
}
