variable "nome" { type = string }
variable "descricao" {
  type    = string
  default = ""
}

variable "policy_json" {
  type = string
  validation {
    condition     = can(jsondecode(var.policy_json))
    error_message = "policy_json precisa ser JSON válido."
  }
}

variable "targets" {
  type        = map(string)
  default     = {}
  description = "apelido -> id da OU/root; canário e produção são instâncias separadas"
}
