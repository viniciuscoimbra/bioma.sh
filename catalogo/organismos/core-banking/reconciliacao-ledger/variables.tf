variable "ambiente" { type = string }
variable "imagem_inicial" { type = string }
variable "kms_key_arn" { type = string }
variable "bucket_evidencia_arn" { type = string }

variable "agenda" {
  type    = string
  default = "cron(0 5 * * ? *)" # depois do fechamento do dia
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }

variable "alarm_actions" {
  type    = list(string)
  default = []
}

variable "metrica_namespace" {
  type        = string
  default     = "ledger"
  description = "namespace das métricas do livro (ex.: <dominio>/ledger); o nome do domínio é da instituição, não deste organismo"
}
