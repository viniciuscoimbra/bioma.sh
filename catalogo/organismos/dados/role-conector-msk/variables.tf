variable "conector" { type = string }
variable "plano" { type = string }
variable "cluster_arn" { type = string }
variable "topicos_arns" { type = list(string) }
variable "grupos_arns" { type = list(string) }

variable "topicos_controle_arns" {
  type        = list(string)
  description = "o tópico de controle do sink Iceberg (leitura e escrita); é o único em que o conector escreve"
}
variable "bucket_destino_arn" { type = string }

variable "recursos_do_catalogo" {
  type        = list(string)
  description = "catálogo, banco e tabelas do bronze que o sink cria e atualiza; sem curinga de conta"
}

variable "registry_arns" {
  type        = list(string)
  description = "ARNs do registry e dos schemas do barramento que o converter lê; o registry mora em outra conta, e o acesso entre contas ao Schema Registry pede política de recurso do Glue naquela conta (confirmar no ambiente antes do primeiro evento)"
}
variable "plugin_bucket_arn" { type = string }

variable "plugin_kms_key_arn" {
  type        = string
  description = "chave que cifra o balde de artefatos da esteira; separada da chave do plano porque o artefato é publicado por outra conta e vale para os dois planos"
}
variable "kms_key_arn" { type = string }
