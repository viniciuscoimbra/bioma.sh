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
