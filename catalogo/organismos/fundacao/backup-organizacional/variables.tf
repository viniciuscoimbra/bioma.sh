variable "nome" { type = string }
variable "kms_primaria_arn" { type = string }

variable "kms_replica_arn" {
  type        = string
  description = "a réplica multi-region na região secundária; grants próprios"
}

variable "role_backup_arn" {
  type        = string
  default     = null
  description = "a role que o serviço de backup assume. Nulo faz esta receita criá-la, porque nenhuma outra peça da árvore a produz."
}
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
