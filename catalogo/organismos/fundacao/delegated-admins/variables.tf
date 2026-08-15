variable "conta_seguranca" { type = string }
variable "conta_identidade" { type = string }

variable "servicos_de_seguranca" {
  type    = list(string)
  default = ["securityhub.amazonaws.com", "config.amazonaws.com", "guardduty.amazonaws.com"]
}

variable "conta_rede" {
  type        = string
  default     = ""
  description = "a conta que administra o IPAM da Organization; vazio pula a delegação"
}
