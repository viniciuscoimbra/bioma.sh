variable "nome" { type = string }
variable "parent_id" { type = string }

variable "registrar" {
  type        = bool
  default     = true
  description = "false só para a Security OU, que não recebe o baseline geral"
}

variable "baseline_identifier" {
  type        = string
  default     = null
  description = "ARN do AWSControlTowerBaseline; obrigatório quando registrar = true"
}

variable "identity_center_baseline_arn" {
  type    = string
  default = null
}
