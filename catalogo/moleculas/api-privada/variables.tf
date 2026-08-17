variable "nome" { type = string }
variable "vpc_endpoint_id" { type = string }

variable "tags" {
  type        = map(string)
  default     = {}
  description = "etiquetas da API, somadas às default_tags do provider"
}
