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

variable "data_api" {
  type        = bool
  default     = false
  description = "o endpoint HTTP do Data API; falso por padrao, liga quem precisa de SQL sem conexao de rede (bootstrap, operacao pontual)"
}

variable "porta" {
  type    = number
  default = 5433

  description = "porta do cluster"

  # Fora da porta padrão de propósito. 5432 é onde toda varredura olha primeiro;
  # trocar não impede quem procura de achar, mas tira o banco da lista dos que
  # se acham sem procurar.
  #
  # Trocar a porta de um cluster QUE JÁ EXISTE reinicia o banco e muda a string
  # de conexão de toda aplicação que fala com ele. Onde nada atende cliente
  # ainda, isso é aceitável; num cluster com carga viva, exige janela combinada.
}

variable "intervalo_monitoramento" {
  type    = number
  default = 60

  description = "segundos entre leituras do monitoramento estendido; zero desliga"

  # Sessenta segundos é o que a AWS cobra como intervalo padrão e é suficiente
  # para separar lentidão de banco de lentidão de máquina. Quem precisa de mais
  # resolução declara, e quem não quer o custo declara zero — e aí o controle
  # correspondente reprova, com razão.
}
