# Organismo reconciliacao-ledger (05): a função que confronta livro novo e
# core vendor, no relógio do Scheduler, gravando o resultado no bucket de
# evidência (organismo evidencia-reconciliacao, por input). O gate da
# migração lê a evidência, nunca o log.

module "reconciliador" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "reconciliacao-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  memoria_mb         = 1024
  timeout_s          = 300
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
  alarm_actions      = var.alarm_actions

  variaveis_de_ambiente = {
    METRICA_NAMESPACE = var.metrica_namespace
    METRICA_AMBIENTE  = var.ambiente
  }
}

resource "aws_iam_role_policy" "grava_evidencia" {
  name = "grava-evidencia"
  role = module.reconciliador.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "s3:PutObject"
        Resource = "${var.bucket_evidencia_arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

# A divergência sai como métrica, e a permissão é estreita: só o namespace do
# livro. PutMetricData não aceita recurso, e a condição é o que sobra de menor
# privilégio.
resource "aws_iam_role_policy" "publica_metrica" {
  name = "publica-metrica-reconciliacao"
  role = module.reconciliador.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "cloudwatch:PutMetricData"
      Resource = "*"
      Condition = {
        StringEquals = { "cloudwatch:namespace" = var.metrica_namespace }
      }
    }]
  })
}

resource "aws_iam_role" "scheduler" {
  name = "reconciliacao-scheduler-${var.ambiente}"

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
  name = "invoca-reconciliacao"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = module.reconciliador.funcao_arn
    }]
  })
}

resource "aws_scheduler_schedule" "diaria" {
  name                = "reconciliacao-${var.ambiente}"
  schedule_expression = var.agenda

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = module.reconciliador.funcao_arn
    role_arn = aws_iam_role.scheduler.arn
  }
}

# O contrato deste organismo promete o alarme, e ele morava só na promessa:
# livro que diverge do core é achado de auditoria, nunca rotina, e uma
# divergência já acorda gente. O erro de execução da função tem alarme
# próprio, dentro da funcao-processadora; este aqui é do NEGÓCIO.
module "alarme_divergencia" {
  source = "../../../moleculas/observabilidade-recurso"

  nome_recurso  = "reconciliacao-${var.ambiente}"
  alarm_actions = var.alarm_actions

  alarmes = {
    "divergencia-do-livro" = {
      namespace   = var.metrica_namespace
      metrica     = "DivergenciaReconciliacao"
      estatistica = "Sum"
      operador    = "GreaterThanThreshold"
      limiar      = 0
      avaliacoes  = 1
      periodo_s   = 300
      dimensoes   = { Ambiente = var.ambiente }
    }
  }
}
