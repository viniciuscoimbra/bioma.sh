variable "plano" { type = string }
variable "regiao" { type = string }

variable "nome_curto" {
  type        = string
  description = "o tópico que este conector aterrissa, em forma curta para nome de recurso (ex.: `<agregado>-<recorte>`); o conector vira iceberg-sink-<nome_curto>-<plano>"
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.nome_curto))
    error_message = "nome_curto em minúsculas, dígitos e hífen: entra em nome de conector, log group e grupo de consumo."
  }
}

variable "campo_data_evento" {
  type        = string
  default     = "eventTime"
  description = "campo do envelope com a data do evento, que particiona a tabela por dia"
}
variable "plugin_bucket_arn" { type = string }
variable "plugin_s3_key" { type = string }
variable "role_conector_arn" { type = string }
variable "bootstrap_servers" { type = string }

variable "topicos" {
  type = list(string)
  validation {
    condition     = length(var.topicos) > 0
    error_message = "Sink sem tópico não aterrissa nada."
  }
  validation {
    condition     = alltrue([for t in var.topicos : can(regex("^[a-z0-9-]+\\.pub\\.[a-z0-9-]+\\.v[0-9]+$", t))])
    error_message = "Só tópico público aterrissa no lake (04 · aresta 1), e o nome dele é <dominio>.pub.<agregado>-<recorte>.vN (01.1 §3)."
  }
}

variable "campo_de_rota" {
  type        = string
  default     = ""
  description = "com mais de um tópico, o campo do evento que nomeia a tabela de destino (iceberg.tables.route-field); com um tópico só, vazio"
  validation {
    condition     = length(var.topicos) == 1 || var.campo_de_rota != ""
    error_message = "Com mais de um tópico e sem campo de rota, cada evento seria escrito em todas as tabelas: declare campo_de_rota."
  }
}

variable "warehouse_bucket_nome" {
  type        = string
  description = "nome do balde bronze: o warehouse do catálogo Iceberg (s3://<nome>/)"
}

variable "database_destino" {
  type        = string
  description = "banco do Glue Data Catalog do DOMÍNIO no bronze (bronze_<dominio>, output de governanca) onde as tabelas nascem"
}

variable "topico_controle" {
  type        = string
  description = "tópico de controle do conector (iceberg.control.topic); nasce pela molécula topico-kafka porque o cluster não cria tópico sozinho"
}

variable "registry_nome" {
  type        = string
  description = "nome do Glue Schema Registry do barramento onde o AVRO dos tópicos está"
}

variable "registry_regiao" {
  type        = string
  description = "região do registry; a mesma do barramento"
}

variable "evoluir_schema" {
  type        = bool
  default     = true
  description = "o conector acompanha evolução compatível do schema (add de coluna); quebra de contrato é produto .v2, não evolução"
}

variable "intervalo_commit_ms" {
  type    = number
  default = 60000
}

variable "tasks_max" {
  type    = number
  default = 2
}

variable "retencao_log_dias" {
  type    = number
  default = 30
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }

variable "max_workers" {
  type    = number
  default = 2
}

variable "config_extra" {
  type        = map(string)
  default     = {}
  description = "ajuste fino que a base não prevê; nunca o lugar da configuração obrigatória"
}
