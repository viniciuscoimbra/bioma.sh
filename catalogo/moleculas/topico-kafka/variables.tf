variable "nome" { type = string }

variable "particoes" {
  type    = number
  default = 1 # preview começa com 1; produção se calcula (01.1 §5)
}

variable "replicacao" {
  type    = number
  default = 3
}

variable "retencao_ms" {
  type    = number
  default = 604800000
}

variable "min_isr" {
  type    = number
  default = 2
}

variable "nome_schema" { type = string }
variable "registry_arn" { type = string }
variable "schema_avro" { type = string }
