variable "destination_arn" { type = string }

variable "log_groups" {
  type        = map(string)
  description = "apelido -> nome do log group a assinar"
}

variable "filtro" {
  type    = string
  default = "" # vazio: tudo
}
