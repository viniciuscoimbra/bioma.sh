# Organismo reconciliacao-ledger (05): a função que confronta livro novo e
# core vendor, no relógio do Scheduler, gravando o resultado no bucket de
# evidência (organismo evidencia-reconciliacao, por input). O gate da
# migração lê a evidência, nunca o log.

module "reconciliador" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "reconciliacao-${var.ambiente}"
  pacote_inicial     = var.pacote_inicial
  memoria_mb         = 1024
  timeout_s          = 300
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
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
