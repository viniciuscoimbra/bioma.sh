variable "prefixo" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "object_lock_bronze" {
  type    = bool
  default = false
}

variable "retencao_lock_dias" {
  type    = number
  default = 1825 # 5 anos, régua regulatória; confirmar por classe de dado
}

variable "dias_para_frio" {
  type    = number
  default = 90
}
