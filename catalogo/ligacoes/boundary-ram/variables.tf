variable "nome" { type = string }
variable "resource_arns" { type = list(string) }

variable "principals" {
  type        = list(string)
  description = "ARNs de OU (preferido) ou de conta"
}
