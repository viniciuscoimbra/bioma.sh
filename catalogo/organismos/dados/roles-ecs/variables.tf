variable "servico" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "recursos_do_catalogo" {
  type        = list(string)
  description = "catálogo e bancos que o processo lê; sem curinga de conta"
}

variable "baldes_arns" {
  type        = list(string)
  default     = []
  description = "baldes que o processo lê, quando lê algum"
}

variable "retencao_log_dias" {
  type        = number
  default     = 30
  description = "quanto tempo o log do contêiner fica; a trilha de auditoria é do CloudTrail, não daqui"
}
