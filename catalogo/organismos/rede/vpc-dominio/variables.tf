variable "dominio" { type = string }
variable "regiao" { type = string }

variable "ambiente" {
  type = string
  validation {
    condition     = contains(["dev", "homolog", "prod"], var.ambiente)
    error_message = "Ambiente deve ser dev, homolog ou prod."
  }
}

variable "ipam_pool_id" {
  type        = string
  description = "pool do ambiente no IPAM; CIDR nunca escolhido à mão (02.2 §3)"
}

variable "netmask" {
  type    = number
  default = 16
}

variable "tgw_id_parameter_arn" {
  type = string
  validation {
    condition     = startswith(var.tgw_id_parameter_arn, "arn:aws:ssm:")
    error_message = "ARN completo do parâmetro do hub; nome simples só resolve na conta que publicou."
  }
}
