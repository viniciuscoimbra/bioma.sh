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

resource "aws_ecr_lifecycle_policy" "limpeza" {
  for_each = aws_ecr_repository.repo

  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "mantém as últimas ${var.imagens_retidas} imagens"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.imagens_retidas
      }
      action = { type = "expire" }
    }]
  })
}
