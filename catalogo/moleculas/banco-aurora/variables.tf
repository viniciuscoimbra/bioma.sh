variable "nome" { type = string }
variable "nome_banco" { type = string }

variable "usuario_mestre" {
  type    = string
  default = "administrador"
}

variable "familia" {
  type    = string
  default = "aurora-postgresql16"
}

variable "versao_engine" {
  type    = string
  default = "16.6"
}

variable "pgaudit_log" {
  type    = string
  default = "write, ddl, role"
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "instancias" {
  type    = number
  default = 2
}

variable "classe" {
  type    = string
  default = "db.r6g.large"
}

variable "retencao_backup_dias" {
  type    = number
  default = 14
}
