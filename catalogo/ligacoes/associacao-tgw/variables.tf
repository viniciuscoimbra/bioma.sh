# De onde o hormônio do attachment é lido. Os três montam o ARN; nenhum deles
# vem da célula que publica, e por isso nenhum precisa de mock.
variable "dominio" { type = string }
variable "ambiente" { type = string }
variable "regiao" { type = string }

variable "conta_dominio" {
  type        = string
  description = "a conta que hospeda a VPC do domínio, e que publica o attachment"
  validation {
    condition     = can(regex("^[0-9]{12}$", var.conta_dominio))
    error_message = "Número de conta AWS: 12 dígitos."
  }
}

variable "route_table_id" {
  type        = string
  description = "o plano ao qual o attachment se associa (a decisão em revisão)"
}

variable "propagar_para" {
  type        = list(string)
  description = "route tables que aprendem as rotas deste attachment"
}
