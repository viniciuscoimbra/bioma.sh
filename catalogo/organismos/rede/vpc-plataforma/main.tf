# Organismo vpc-plataforma (02.2, instância por plano): a rede de uma conta de
# plataforma. O mesmo contrato da vpc-dominio, com o plano no lugar do
# ambiente: prod só fala com prod.

module "vpc" {
  source = "../vpc-dominio"

  dominio              = var.conta_plataforma
  ambiente             = var.plano == "producao" ? "prod" : "dev" # mapeia plano→classe do attachment
  regiao               = var.regiao
  ipam_pool_id         = var.ipam_pool_id
  netmask              = var.netmask
  tgw_id_parameter_arn = var.tgw_id_parameter_arn
}
