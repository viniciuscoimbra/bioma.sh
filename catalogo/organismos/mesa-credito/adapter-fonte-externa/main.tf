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

# A API precisa de PELO MENOS UM método antes de existir deployment: a AWS
# recusa `CreateDeployment` numa REST API vazia, e o erro chega no fim do apply,
# com todo o resto já criado (medido numa instalação real em 2026-09-01: dez de
# onze recursos de pé e o deployment recusado). Quem instancia esta receita não
# tem como consertar do lado dela, porque a API nasce aqui.
#
# O método mínimo é um `GET /health` com integração MOCK, que não chama a Lambda
# e não conhece rota nenhuma da aplicação. As rotas de verdade continuam sendo da
# esteira: o deployment ignora mudança por completo, e é a esteira que redeploya
# quando publica rota nova.
#
# `authorization = "NONE"` é seguro AQUI e não seria numa API pública: esta é
# PRIVATE, e a resource policy da molécula api-privada só admite o VPC endpoint
# do ambiente. Quem chega no /health já está dentro da rede que a VPN autoriza.
resource "aws_api_gateway_resource" "health" {
  rest_api_id = module.porta.api_id
  parent_id   = module.porta.root_resource_id
  path_part   = "health"
}

resource "aws_api_gateway_method" "health" {
  rest_api_id   = module.porta.api_id
  resource_id   = aws_api_gateway_resource.health.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "health" {
  rest_api_id = module.porta.api_id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({ statusCode = 200 })
  }
}

resource "aws_api_gateway_method_response" "health" {
  rest_api_id = module.porta.api_id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health.http_method
  status_code = "200"

  response_models = { "application/json" = "Empty" }
}

# Com corpo, e não vazio: um health que responde 200 sem dizer nada obriga quem
# investiga a confiar no código de status. O MOCK não sabe da aplicação, então o
# que ele afirma é só o que é verdade: a porta responde.
resource "aws_api_gateway_integration_response" "health" {
  rest_api_id = module.porta.api_id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health.http_method
  status_code = aws_api_gateway_method_response.health.status_code

  response_templates = {
    "application/json" = jsonencode({ porta = "ok" })
  }

  depends_on = [aws_api_gateway_integration.health]
}

resource "aws_api_gateway_deployment" "esta" {
  rest_api_id = module.porta.api_id

  lifecycle {
    create_before_destroy = true
    ignore_changes        = all # rotas e redeploy são da aplicação (esteira)
  }

  # A ordem é o ponto: sem isto o Terraform cria o deployment em paralelo com o
  # método, e a recusa volta a acontecer de forma intermitente, no apply de quem
  # tiver azar com a ordem do grafo.
  depends_on = [aws_api_gateway_integration_response.health]
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
