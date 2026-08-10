# Molécula segredo: o cofre; o valor entra por canal próprio, nunca daqui.

resource "aws_secretsmanager_secret" "este" {
  name       = var.nome
  kms_key_id = var.kms_key_arn
  policy     = var.resource_policy_json
}

resource "aws_secretsmanager_secret_rotation" "rotacao" {
  count = var.rotacao_lambda_arn == null ? 0 : 1

  secret_id           = aws_secretsmanager_secret.este.id
  rotation_lambda_arn = var.rotacao_lambda_arn

  rotation_rules {
    automatically_after_days = var.dias_rotacao
  }
}
