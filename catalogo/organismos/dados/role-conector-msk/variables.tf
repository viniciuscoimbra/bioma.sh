variable "conector" { type = string }
variable "plano" { type = string }
variable "cluster_arn" { type = string }
variable "topicos_arns" { type = list(string) }
variable "grupos_arns" { type = list(string) }
variable "bucket_destino_arn" { type = string }
variable "plugin_bucket_arn" { type = string }

variable "plugin_kms_key_arn" {
  type        = string
  description = "chave que cifra o balde de artefatos da esteira; separada da chave do plano porque o artefato é publicado por outra conta e vale para os dois planos"
}
variable "kms_key_arn" { type = string }
