variable "nome" { type = string }

variable "email" {
  type = string
  validation {
    condition     = can(regex("@", var.email))
    error_message = "E-mail raiz da conta; use alias por conta (usuario+conta@)."
  }
}

variable "ou_id" {
  type        = string
  description = "OU registrada onde a conta nasce; o enrollment é assíncrono e o gate é da esteira"
}

variable "role_de_acesso" {
  type    = string
  default = "OrganizationAccountAccessRole"
}

variable "tags" {
  type        = map(string)
  description = "Tags de alocação: obrigatórias antes do primeiro workload (00·D6)"
}

variable "contatos" {
  type = map(object({
    nome = string, titulo = string, email = string, telefone = string
  }))
  default     = {}
  description = "Contatos alternativos por tipo (BILLING, OPERATIONS, SECURITY)"
}
