variable "plano" { type = string }
variable "escopo" {
  type    = string
  default = "REGIONAL"
}

variable "regras_gerenciadas" {
  type    = list(string)
  default = ["AWSManagedRulesCommonRuleSet", "AWSManagedRulesKnownBadInputsRuleSet"]
}

variable "recursos_alvo" {
  type    = list(string)
  default = []
}
