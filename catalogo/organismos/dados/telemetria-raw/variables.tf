variable "prefixo" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "retencao_dias" {
  type    = number
  default = 400
}
