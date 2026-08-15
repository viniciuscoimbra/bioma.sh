variable "conta_plataforma" { type = string }
variable "regiao" { type = string }

variable "plano" {
  type = string
  # Mesmo motivo do ambiente na vpc-dominio: o vocabulário é da instituição, e
  # quem confere é convencoes.json. Aqui sobra a forma.
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.plano))
    error_message = "Plano em minúsculas, começando por letra: ele entra em nome de recurso."
  }
}

variable "ipam_pool_id" { type = string }
variable "tgw_id" { type = string }

variable "netmask" {
  type    = number
  default = 16
}

variable "cidrs_permitidos" {
  type        = list(string)
  default     = []
  description = "quem entra nas cargas desta VPC vindo de fora dela: o CIDR de cada VPC par, ligado ao output cidr_block dela na célula (02·D5)"
}

variable "regras_dns_ids" {
  type    = list(string)
  default = []
}
