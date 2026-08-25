# Organismo adapter-fonte-externa (06): o adaptador por bureau (molécula
# funcao-processadora + molécula segredo com a credencial). A fonte externa é
# fronteira; só a nossa ponta entra. Saída pra internet pela inspeção central.
#
# A porta síncrona (api-privada) é o que o CONTRATO.md já prometia e o main.tf
# não construía: quem alcança o adapter de dentro da rede do domínio, sem
# internet. Rotas e integrações são da aplicação (esteira), mesmo padrão de
# core-banking/borda-transacional — aqui só nasce a API e o par
# deployment/stage vazio, redeploy é de quem publica a rota.

locals {
  nome_segredo = "mesa-credito/${var.ambiente}/${var.fonte}"
}

module "adapter" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "adapter-${var.fonte}-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  timeout_s          = 30
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn

  # Aponta o NOME do segredo, nunca o valor: mesmo padrão de
  # organismos/core-banking/desembolso (Program.cs, AddAwsSecretsManager).
  variaveis_de_ambiente = {
    SecretsManager__SecretId = local.nome_segredo
  }
}

module "credencial" {
  source = "../../../moleculas/segredo"

  nome        = local.nome_segredo
  kms_key_arn = var.kms_key_arn
}

module "porta" {
  source = "../../../moleculas/api-privada"

  nome            = "adapter-${var.fonte}-${var.ambiente}"
  vpc_endpoint_id = var.vpc_endpoint_id
}

resource "aws_api_gateway_deployment" "esta" {
  rest_api_id = module.porta.api_id

  lifecycle {
    create_before_destroy = true
    ignore_changes        = all # rotas e redeploy são da aplicação (esteira)
  }
}

resource "aws_api_gateway_stage" "este" {
  rest_api_id   = module.porta.api_id
  deployment_id = aws_api_gateway_deployment.esta.id
  stage_name    = var.ambiente
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
