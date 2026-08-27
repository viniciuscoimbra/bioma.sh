variable "conta_seguranca" { type = string }
variable "conta_identidade" { type = string }

variable "servicos_de_seguranca" {
  type = list(string)
  default = [
    "securityhub.amazonaws.com",
    "config.amazonaws.com",
    "guardduty.amazonaws.com",
    # O Access Analyzer também delega pelo Organizations, e faltava: sem esta
    # linha o analyzer de tipo ORGANIZATION não pode nascer na conta de
    # segurança, e o único analyzer possível é o da própria conta — que vê uma
    # conta de quarenta e nove.
    "access-analyzer.amazonaws.com",
  ]
}

variable "conta_rede" {
  type        = string
  default     = ""
  description = "a conta que administra o IPAM da Organization; vazio pula a delegação"
}
