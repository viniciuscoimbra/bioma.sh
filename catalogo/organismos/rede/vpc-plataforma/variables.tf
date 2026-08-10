variable "conta_plataforma" { type = string }
variable "regiao" { type = string }

variable "plano" {
  type = string
  validation {
    condition     = contains(["producao", "nao-producao"], var.plano)
    error_message = "Plano deve ser producao ou nao-producao."
  }
}

variable "ipam_pool_id" { type = string }
variable "tgw_id_parameter_arn" { type = string }

variable "netmask" {
  type    = number
  default = 16
}
