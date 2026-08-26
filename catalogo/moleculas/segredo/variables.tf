variable "nome" { type = string }
variable "kms_key_arn" { type = string }

variable "resource_policy_json" {
  type    = string
  default = null
}

variable "rotacao_lambda_arn" {
  type    = string
  default = null
}

variable "dias_rotacao" {
  type    = number
  default = 90
}

variable "descricao" {
  type        = string
  description = "o que o cofre guarda e como o valor entra, para quem o encontra pelo console; nulo deixa sem"
  default     = null
}
