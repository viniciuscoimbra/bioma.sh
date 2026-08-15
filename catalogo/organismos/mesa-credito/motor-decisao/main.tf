# Organismo motor-decisao (06): a orquestração da decisão em Step Functions
# Express (resposta síncrona ao canal). A política do motor (regras, cortes)
# é configuração da aplicação; a definição chega por artefato.

resource "aws_iam_role" "motor" {
  name = "motor-decisao-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "states.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "invoca_passos" {
  name = "invoca-passos"
  role = aws_iam_role.motor.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "lambda:InvokeFunction"
        Resource = var.funcoes_passos_arns
      },
      {
        Effect   = "Allow"
        Action   = "sagemaker:InvokeEndpoint"
        Resource = var.score_endpoint_arn
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "motor" {
  name              = "/sfn/motor-decisao-${var.ambiente}"
  retention_in_days = 30
  kms_key_id        = var.kms_key_arn
}

resource "aws_sfn_state_machine" "motor" {
  name       = "motor-decisao-${var.ambiente}"
  role_arn   = aws_iam_role.motor.arn
  definition = var.definicao_asl
  type       = "EXPRESS"

  logging_configuration {
    log_destination        = "${aws_cloudwatch_log_group.motor.arn}:*"
    include_execution_data = false # decisão de crédito não vaza pro log
    level                  = "ERROR"
  }
}
