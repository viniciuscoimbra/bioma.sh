# Organismo adapter-fonte-externa (06): o adaptador por bureau (molécula
# funcao-processadora + molécula segredo com a credencial). A fonte externa é
# fronteira; só a nossa ponta entra. Saída pra internet pela inspeção central.

module "adapter" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "adapter-${var.fonte}-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  timeout_s          = 30
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
}

module "credencial" {
  source = "../../../moleculas/segredo"

  nome        = "mesa-credito/${var.ambiente}/${var.fonte}"
  kms_key_arn = var.kms_key_arn
}

resource "aws_iam_role_policy" "le_credencial" {
  name = "le-credencial"
  role = module.adapter.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = module.credencial.arn
      },
      {
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.kms_key_arn
      }
    ]
  })
}
