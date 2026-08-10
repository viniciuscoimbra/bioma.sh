variable "conta_seguranca" { type = string }
variable "conta_identidade" { type = string }

variable "servicos_de_seguranca" {
  type    = list(string)
  default = ["securityhub.amazonaws.com", "config.amazonaws.com", "guardduty.amazonaws.com"]
}
