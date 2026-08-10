variable "consumidor" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "roles_acesso_lake" {
  type    = list(string)
  default = []
}

variable "rpu_base" {
  type    = number
  default = 8
}

variable "rpu_teto" {
  type    = number
  default = 32
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
