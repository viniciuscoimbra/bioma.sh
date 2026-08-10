# Organismo borda-interna: a porta síncrona do domínio para os outros domínios.
# Compõe a molécula api-privada; rotas e integrações são da aplicação.

module "api" {
  source = "../../../moleculas/api-privada"

  nome            = "${var.dominio}-interna-${var.ambiente}"
  vpc_endpoint_id = var.vpc_endpoint_id
}

resource "aws_ssm_parameter" "endereco" {
  name  = "/dominios/${var.dominio}/${var.ambiente}/borda-interna/api-id"
  type  = "String"
  tier  = "Advanced" # lido por ARN completo de outras contas (RAM)
  value = module.api.api_id
}
