variable "plano" { type = string }
variable "administradores_arns" { type = list(string) }
variable "role_jobs_arn" { type = string }
variable "kms_key_arn" { type = string }

variable "buckets_registrados" {
  type        = map(string)
  description = "camada => ARN do balde que o Lake Formation passa a governar (bronze e silver da plataforma); o gold do domínio se registra em porta-dados"
  validation {
    condition     = length(var.buckets_registrados) > 0
    error_message = "Governança sem balde registrado é Lake Formation sem lake: nada é governado."
  }
}

variable "log_group_jobs" {
  type        = string
  description = "o grupo de log que a role dos jobs alcança (output de role-jobs-glue); o Glue escreve nos grupos padrão quando ninguém diz o contrário"
}

variable "dominios" {
  type        = list(string)
  default     = []
  description = "os domínios produtores cujo tópico público aterrissa no lake; cada um ganha bronze_<dominio> e silver_<dominio>"
}

variable "lf_tags" {
  type    = map(list(string))
  default = { classificacao = ["publico", "interno", "restrito", "pii"] }
}

variable "contas_que_classificam" {
  type        = list(string)
  default     = []
  description = "contas de domínio produtor que atribuem as LF-Tags desta plataforma aos próprios produtos (classificacao-lake); recebem DESCRIBE e ASSOCIATE em cada tag"
}

variable "jobs_silver" {
  type = map(object({
    script_s3 = string
    workers   = number
  }))
  default = {}
}

variable "incluir_quem_aplica" {
  type        = bool
  default     = true
  description = "põe o principal do apply entre os administradores do lake; sem isso o apply se remove e perde a permissão no recurso seguinte"
}
