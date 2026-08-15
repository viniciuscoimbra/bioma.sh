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

# De onde o hormônio do hub é lido. Nenhum dos dois vem da célula que o publica,
# e por isso nenhum precisa de mock.
variable "conta_rede" {
  type        = string
  description = "a conta que hospeda o Transit Gateway e publica o identificador dele"
  validation {
    condition     = can(regex("^[0-9]{12}$", var.conta_rede))
    error_message = "Número de conta AWS: 12 dígitos."
  }
}
