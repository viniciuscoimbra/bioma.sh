variable "nome" { type = string }

variable "host" {
  type        = string
  description = "onde o serviço atende, visto de dentro da VPC"
}

variable "porta" { type = number }

variable "etiqueta" {
  type        = string
  description = "a etiqueta que marca a máquina saltadora"
}

variable "valores_da_etiqueta" { type = list(string) }

variable "nome_politica" {
  type        = string
  default     = "abrir-tunel"
  description = "nome-contrato que o conjunto referencia; igual em toda conta"
}
