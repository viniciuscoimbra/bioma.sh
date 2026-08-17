variable "dono" {
  type        = string
  description = "quem responde por esta role: o domínio, ou a plataforma"
}

variable "ambiente" { type = string }

variable "bucket_arn" {
  type        = string
  description = "a camada que esta role escreve; gold do domínio ou silver da plataforma, conforme quem chama"
}

variable "kms_key_arn" { type = string }

variable "buckets_leitura_arns" {
  type        = list(string)
  default     = []
  description = "camadas que este job só lê (o bronze para o job Silver, o silver para o job Gold); vazio significa que o job só toca o próprio balde"
}

variable "recursos_do_catalogo" {
  type        = list(string)
  description = "catálogo, banco e tabelas que este job alcança; sem curinga de conta"
}

variable "script_bucket_arn" {
  type        = string
  default     = ""
  description = "balde onde a esteira publica o script do job, quando o script mora fora do balde de dado; vazio significa que nenhum job desta célula lê script de fora"
}

variable "script_kms_key_arn" {
  type        = string
  default     = ""
  description = "chave que cifra o balde do script; separada da chave do domínio porque quem publica o artefato é outra conta"
}

variable "retencao_log_dias" {
  type        = number
  default     = 30
  description = "quanto tempo o log operacional do job fica; a trilha de auditoria é do CloudTrail, não daqui"
}
