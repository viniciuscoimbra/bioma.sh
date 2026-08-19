variable "nome" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9.-]*$", var.nome)) && !can(regex("_", var.nome))
    error_message = "Nome de tópico em minúsculas com `.` e `-`; sem `_`, porque `a.b` e `a_b` colidem no nome da métrica do Kafka."
  }
}

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

variable "config_extra" {
  type        = map(string)
  default     = {}
  description = "configuração de tópico além do trio retenção, limpeza e ISR (ex.: max.message.bytes); nunca o lugar de `cleanup.policy`"
}

variable "nome_schema" {
  type        = string
  default     = ""
  description = "nome do schema no registry (<org>-<dominio>-<agregado>-<evento>; SchemaName não aceita ponto); vazio quando o tópico não tem contrato Avro (controle, interno de infraestrutura)"
}

variable "registry_arn" {
  type    = string
  default = ""
}

variable "schema_avro" {
  type        = string
  default     = ""
  description = "o contrato Avro do evento; vazio cria só o tópico"
  validation {
    condition     = var.schema_avro == "" || (var.nome_schema != "" && var.registry_arn != "")
    error_message = "Com schema_avro, nome_schema e registry_arn são obrigatórios."
  }
}
