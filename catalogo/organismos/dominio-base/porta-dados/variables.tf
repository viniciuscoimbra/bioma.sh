variable "dominio" { type = string }
variable "ambiente" { type = string }
variable "bucket_gold_arn" { type = string }
variable "kms_key_arn" { type = string }

variable "administradores_arns" {
  type        = list(string)
  description = "quem administra o Lake Formation desta conta (a role da esteira que aplica); sem administrador nenhum grant se concede"
}

variable "incluir_quem_aplica" {
  type        = bool
  default     = true
  description = "põe o principal do apply entre os administradores do lake desta conta; sem isso o apply configura o Lake Formation e perde a permissão no recurso seguinte (mesmo padrão da governanca)"
}
