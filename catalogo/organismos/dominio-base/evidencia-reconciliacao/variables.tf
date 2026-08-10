variable "prefixo" { type = string }
variable "dominio" { type = string }
variable "ambiente" { type = string }
variable "kms_key_arn" { type = string }

variable "retencao_dias" {
  type    = number
  default = 1825
}
