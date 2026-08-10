variable "nome" { type = string }
variable "kms_primaria_arn" { type = string }

variable "kms_replica_arn" {
  type        = string
  description = "a réplica multi-region na região secundária; grants próprios"
}

variable "role_backup_arn" { type = string }
variable "agenda_cron" {
  type    = string
  default = "cron(0 5 * * ? *)"
}
variable "retencao_dias" {
  type    = number
  default = 365
}
variable "retencao_minima_dias" {
  type    = number
  default = 30
}
