variable "cidr_terminacao" {
  type    = string
  default = "100.64.16.0/24"
}

variable "cidr_clientes" { type = string }
variable "azs" { type = list(string) }
variable "certificado_arn" {
  type        = string
  description = "certificado de servidor da VPN, no ACM"
}

variable "autenticacao" {
  type    = string
  default = "certificado"
  validation {
    condition     = contains(["certificado", "federada"], var.autenticacao)
    error_message = "autenticacao é `certificado` (sem IdP) ou `federada` (com IdP corporativo)."
  }
  description = "quem autentica a pessoa: a CA de clientes, ou o IdP por SAML"
}

variable "saml_provider_arn" {
  type        = string
  default     = ""
  description = "só quando autenticacao = federada"
  validation {
    condition     = var.saml_provider_arn == "" || startswith(var.saml_provider_arn, "arn:aws:iam::")
    error_message = "ARN do provedor SAML, ou vazio quando a autenticação é por certificado."
  }
}

variable "ca_clientes_arn" {
  type        = string
  default     = null
  description = "só quando autenticacao = certificado: a CA que emite o certificado de cada pessoa"
}
variable "log_group" { type = string }

variable "autorizacoes" {
  type        = map(object({ cidr = string, grupo = optional(string) }))
  description = "apelido -> {cidr do domínio (/16), grupo do IdP quando federada}"
}

variable "tgw_id" {
  type        = string
  description = "o hub; sem ele a VPC de terminação não fala com domínio nenhum"
}

variable "plano" {
  type        = string
  default     = "nao-producao"
  description = "o plano de rota do attachment; a associação no hub é da ligação"
}
