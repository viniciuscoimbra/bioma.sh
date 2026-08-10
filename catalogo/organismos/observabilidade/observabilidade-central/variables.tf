variable "plano" { type = string }
variable "contas_fonte" { type = list(string) }

variable "runbooks" {
  type        = map(string)
  description = "nome -> conteúdo YAML do documento SSM Automation"
  default     = {}
}
