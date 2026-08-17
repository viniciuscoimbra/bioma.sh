variable "nome" { type = string }

variable "engine" {
  type        = string
  description = "engine do RDS: oracle-se2, oracle-ee, sqlserver-se, postgres, mysql"
}

variable "versao_engine" {
  type        = string
  description = "versão maior (19) ou completa; a menor sobe na janela de manutenção"
}

variable "modelo_licenca" {
  type        = string
  default     = null
  description = "license-included ou bring-your-own-license; nulo nas engines livres"
}

variable "conjunto_caracteres" {
  type        = string
  default     = ""
  description = "só Oracle e SQL Server; decisão de criação, trocar depois é recriar"
}

variable "nome_banco" {
  type        = string
  default     = ""
  description = "em Oracle é o SID, no máximo 8 caracteres"

  validation {
    condition     = var.nome_banco == "" || can(regex("^[A-Za-z][A-Za-z0-9]{0,7}$", var.nome_banco))
    error_message = "nome_banco começa com letra, é alfanumérico e cabe em 8 caracteres: é o SID do Oracle, e a AWS recusa o resto depois de meia hora de provisionamento."
  }
}

variable "classe" {
  type        = string
  description = "classe da instância; em engine licenciada a licença é cobrada por vCPU"
}

variable "armazenamento_gb" { type = number }

variable "armazenamento_maximo_gb" {
  type        = number
  default     = null
  description = "teto do crescimento automático; nulo desliga o crescimento"
}

variable "tipo_armazenamento" {
  type    = string
  default = "gp3"
}

variable "usuario_mestre" {
  type    = string
  default = "administrador"
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "espelho_em_outra_zona" {
  type        = bool
  description = "espelho síncrono na segunda zona; em engine licenciada a cópia também paga licença"
}

variable "retencao_backup_dias" {
  type    = number
  default = 14
}

variable "janela_backup" {
  type    = string
  default = "04:00-05:00"
}

variable "janela_manutencao" {
  type    = string
  default = "sun:06:00-sun:07:00"
}

variable "logs_exportados" {
  type        = list(string)
  default     = []
  description = "o que a engine publica no CloudWatch; em Oracle: alert, audit, listener, trace"
}

variable "aplicar_na_hora" {
  type        = bool
  default     = false
  description = "mudança fora da janela de manutenção; ligar reinicia o banco"
}

variable "nome_politica_administracao" {
  type        = string
  default     = "administrar-banco"
  description = "nome-contrato que o conjunto do DBA referencia; igual em toda conta"
}
