variable "plano" { type = string }
variable "pacote_inicial" { type = string }
variable "kms_key_arn" { type = string }

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "agenda_redrive" {
  type    = string
  default = "rate(15 minutes)"
}
