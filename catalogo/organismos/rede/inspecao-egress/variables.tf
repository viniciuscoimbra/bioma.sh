variable "plano" { type = string }

variable "cidr_inspecao" {
  type    = string
  default = "100.64.0.0/21"
}

variable "azs" { type = list(string) }
variable "tgw_id_parameter_arn" { type = string }

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
