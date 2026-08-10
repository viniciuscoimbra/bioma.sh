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
