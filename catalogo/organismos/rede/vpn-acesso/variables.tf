variable "cidr_terminacao" {
  type    = string
  default = "100.64.16.0/24"
}

variable "cidr_clientes" { type = string }
variable "azs" { type = list(string) }
variable "certificado_arn" { type = string }
variable "saml_provider_arn" { type = string }
variable "log_group" { type = string }

variable "autorizacoes" {
  type        = map(object({ cidr = string, grupo_id = string }))
  description = "apelido -> {cidr do domínio (/16), grupo do IdP}"
}
