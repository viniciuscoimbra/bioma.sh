# De onde o hormônio do hub é lido. Nenhum dos dois vem da célula que o publica,
# e por isso nenhum precisa de mock.
variable "regiao" { type = string }

variable "plano" { type = string }

variable "cidr_inspecao" {
  type    = string
  default = "100.64.0.0/21"
}

variable "azs" { type = list(string) }
variable "conta_rede" {
  type        = string
  description = "a conta que hospeda o Transit Gateway e publica o identificador dele"
  validation {
    condition     = can(regex("^[0-9]{12}$", var.conta_rede))
    error_message = "Número de conta AWS: 12 dígitos."
  }
}

variable "grupos_de_regra_arns" {
  type        = list(string)
  default     = []
  description = "regras stateful; a política de egress é decisão de segurança, por PR"
}

variable "supernet_interna" {
  type        = string
  description = "a faixa que volta para o hub depois da inspeção"

  # 10/8 inteiro: as quatro supernets do plano de endereçamento cabem dentro
  # dele, e a rota de volta não precisa mudar a cada ambiente novo.
  default = "10.0.0.0/8"
}
