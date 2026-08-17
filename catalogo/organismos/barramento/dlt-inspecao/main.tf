# Organismo dlt-inspecao (01.1 §8): três peças sem misturar função: o consumer
# do DLT materializa; o DynamoDB guarda os mortos por categoria; o Scheduler é
# só o relógio do redrive do balde transitório. Veneno espera decisão humana.

module "consumer_dlt" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "dlt-consumer-${var.plano}"
  imagem_inicial     = var.imagem_inicial
  memoria_mb         = 512
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
}

resource "aws_dynamodb_table" "mortos" {
  name         = "eventos-mortos-${var.plano}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  lifecycle { prevent_destroy = true } # evidência de falha é durável
}

resource "aws_iam_role" "scheduler" {
  name = "dlt-redrive-scheduler-${var.plano}"

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
  name = "invoca-redrive"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = module.consumer_dlt.funcao_arn
    }]
  })
}

resource "aws_scheduler_schedule" "redrive" {
  name                = "dlt-redrive-${var.plano}"
  schedule_expression = var.agenda_redrive

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = module.consumer_dlt.funcao_arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ acao = "redrive", balde = "transitorio" }) # nunca o veneno
  }
}
