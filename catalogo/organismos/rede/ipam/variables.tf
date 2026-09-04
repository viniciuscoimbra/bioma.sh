variable "regiao" { type = string }

variable "supernets" {
  type        = map(string)
  description = "ambiente -> supernet (ex.: prd 10.0.0.0/10, hml 10.64.0.0/10, dev 10.128.0.0/10)"
}

variable "supernets_por_regiao" {
  type        = map(map(string))
  default     = {}
  description = "região -> (ambiente -> supernet), para os planos que nascem FORA da região principal. Cada região ganha escopo próprio, porque o mesmo CIDR existe dos dois lados enquanto os dois coexistem. Vazio por padrão: quem não move plano nenhum não vê diferença."
}
