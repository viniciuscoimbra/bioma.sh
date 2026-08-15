# Organismo borda-transacional (01 §9, 05): a porta síncrona do core para os
# canais. Compõe api-privada; idempotência por chave de requisição é contrato
# da aplicação, o throttling fica na infra.

module "api" {
  source = "../../../moleculas/api-privada"

  nome            = "transacional-${var.ambiente}"
  vpc_endpoint_id = var.vpc_endpoint_id
}

resource "aws_api_gateway_deployment" "esta" {
  rest_api_id = module.api.api_id

  lifecycle {
    create_before_destroy = true
    ignore_changes        = all # rotas e redeploy são da aplicação (esteira)
  }
}

resource "aws_api_gateway_stage" "este" {
  rest_api_id   = module.api.api_id
  deployment_id = aws_api_gateway_deployment.esta.id
  stage_name    = var.ambiente
}

resource "aws_api_gateway_method_settings" "teto" {
  rest_api_id = module.api.api_id
  stage_name  = aws_api_gateway_stage.este.stage_name
  method_path = "*/*"

  settings {
    throttling_rate_limit  = var.rps_teto
    throttling_burst_limit = var.burst_teto
    metrics_enabled        = true
  }
}
