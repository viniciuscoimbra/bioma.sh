variable "root_id" { type = string }

# `registrar` liga o baseline do Control Tower naquela OU. A Security OU do
# Control Tower não recebe o baseline geral, e OU agrupadora que não hospeda
# conta também não precisa: quem registra é onde a conta mora.
variable "ous_nivel_1" {
  type        = map(object({ registrar = bool }))
  description = "Security, Infrastructure, Platform, Workloads, Sandbox"
}

variable "ous_nivel_2" {
  type        = map(object({ pai = string, registrar = bool }))
  description = "CIAM sob Security; as capacidades sob Platform; os domínios de negócio sob Workloads"
  default     = {}
}

variable "ous_nivel_3" {
  type        = map(object({ pai = string, registrar = bool }))
  description = "as OUs sob as agrupadoras Credito e Canais"
  default     = {}
}

variable "baseline_identifier" {
  type    = string
  default = null
}
variable "identity_center_baseline_arn" {
  type    = string
  default = null
}
