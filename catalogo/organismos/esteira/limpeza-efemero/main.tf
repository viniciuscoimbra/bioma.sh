# Organismo limpeza-efemero (15.2 · anatomia do efêmero): a guarda que caça
# sobreviventes. O pôster exige dois mecanismos que nenhum workflow
# implementa — destruição por TTL de inatividade, e uma varredura agendada —
# porque preview-pr.yml e candidato-hml.yml só reagem a evento de PR. Se o
# workflow de encerramento nunca rodar (PR abandonado, falha de runner), nada
# limpa, e o recurso vira custo silencioso.
#
# LIMITAÇÃO DE DESIGN QUE PRECISA FICAR EXPLÍCITA: esta função NÃO chama
# `terragrunt destroy`. Ela não tem acesso ao state do Terraform da célula
# efêmera (esse state mora no repositório do serviço, fora daqui) e não deve
# ganhar esse acesso — misturaria a guarda com o pipeline que ela guarda. Em
# vez disso, ela destrói os recursos AWS diretamente pela API (Lambda,
# API Gateway, Route53). Consequência: depois que a limpeza atua, o state do
# Terraform do repositório do serviço fica desalinhado com a realidade (drift
# proposital). A tarefa 8.5 do plano de validação testa exatamente esse
# caminho: forçar um órfão e confirmar que a limpeza o remove sem depender do
# state.
#
# Fora do módulo ambiente-efemero de propósito: é guarda permanente, e não
# deve depender do mesmo sistema (o workflow do PR) que criou o recurso.

locals {
  nome = "limpeza-efemero-${var.ambiente}"
}

module "varredura" {
  source = "../../../moleculas/funcao-processadora"

  nome           = local.nome
  imagem_inicial = var.imagem_inicial
  timeout_s      = 300 # uma varredura de conta inteira pode levar mais que o default de 60s
  memoria_mb     = 512

  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn

  tags = { papel = "limpeza-efemero" }
}

# O escopo é amplo de propósito (list/describe é sempre seguro; destroy é o
# que precisa de cautela) e restrito por ETIQUETA no lado do destroy, não por
# ARN — a varredura não sabe de antemão quais prefixos existem.
resource "aws_iam_role_policy" "varredura_escopo" {
  name = "varre-e-destroi-efemero"
  role = module.varredura.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # localizar candidatos: a mesma API que os workflows já usam
        # (resourcegroupstaggingapi get-resources) para contar previews e
        # caçar órfãos por etiqueta.
        Sid    = "Localiza"
        Effect = "Allow"
        Action = [
          "tag:GetResources",
          "lambda:ListFunctions",
          "lambda:GetFunction",
          "lambda:ListTags",
          "lambda:ListAliases",
          "apigateway:GET",
          # Route53 não tem tag de recurso (registro não é etiquetável — ver
          # comentário abaixo), então a varredura precisa enumerar as zonas
          # privadas da conta para achar o registro do prefixo. Sem
          # ListHostedZones a função não descobre onde procurar, e sem
          # ListResourceRecordSets não acha o registro dentro da zona.
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
        ]
        Resource = "*"
      },
      {
        # destruir o que a varredura decidiu que passou do TTL. A condição de
        # tag limita a ação a recurso etiquetado por este organismo (nunca
        # toca recurso sem efemero=preview|homologacao).
        Sid    = "DestroiSoOEtiquetado"
        Effect = "Allow"
        Action = [
          "lambda:DeleteFunction",
          "lambda:DeleteAlias",
          "apigateway:DELETE",
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "aws:ResourceTag/efemero" = ["preview", "homologacao"]
          }
        }
      },
      {
        # Route53 não suporta condição por tag de recurso (registro não é
        # etiquetável): o escopo aqui fica pela zona, e a função filtra por
        # padrão de nome antes de chamar ChangeResourceRecordSets. A zona é
        # UMA, a privada do ambiente que ambiente-efemero popula: a policy
        # trava nela, e a função decide qual registro apagar dentro dela.
        Sid      = "LimpaRegistroNaZonaPrivada"
        Effect   = "Allow"
        Action   = "route53:ChangeResourceRecordSets"
        Resource = "arn:aws:route53:::hostedzone/${var.zona_dns_id}"
      },
    ]
  })
}

resource "aws_iam_role" "scheduler" {
  name = "${local.nome}-scheduler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "invoca" {
  name = "invoca-varredura"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = module.varredura.funcao_arn
    }]
  })
}

resource "aws_scheduler_schedule" "varredura" {
  name                = local.nome
  schedule_expression = var.agenda

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = module.varredura.funcao_arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ ttl_horas = var.ttl_horas, ambiente = var.ambiente })
  }
}
