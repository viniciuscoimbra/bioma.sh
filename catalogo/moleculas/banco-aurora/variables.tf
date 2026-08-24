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
  type = string
  # A AWS aposenta minors do Aurora sem aviso no plano: o 16.6 sumiu de
  # sa-east-1 em agosto de 2026 e o CreateDBCluster passou a falhar com
  # "Cannot find version". O default acompanha a minor mais nova da major que
  # o desenho declara (aurora-postgresql16); trocar de MAJOR é decisão da
  # célula, nunca deste default.
  default = "16.14"
}

variable "pgaudit_log" {
  type = string
  # Sem espaço depois da vírgula: o RDS normaliza o valor e devolve
  # "write,ddl,role". Com espaço, o plano propõe a mesma troca em toda
  # execução, para sempre, e um plano que nunca fica limpo é um plano que
  # ninguém lê.
  default = "write,ddl,role"
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
