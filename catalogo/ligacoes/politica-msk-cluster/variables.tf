variable "cluster_arn" { type = string }
variable "contas_consumidoras" { type = list(string) }

variable "conectores_arns" {
  type        = list(string)
  default     = []
  description = "roles de conector de outra conta que falam o protocolo IAM direto com os brokers (o sink Iceberg da conta de dados)"
}

variable "topicos_dos_conectores" {
  type        = list(string)
  default     = []
  description = "nomes (ou padrões) dos tópicos que esses conectores leem e do tópico de controle que escrevem; o ARN se monta a partir do ARN do cluster"
}

variable "grupos_dos_conectores" {
  type        = list(string)
  default     = []
  description = "padrões dos grupos de consumo desses conectores (connect-<nome-do-conector>*)"
}

# Quem ESCREVE no barramento de outra conta. Lista à parte de `conectores_arns`
# porque produtor não lê e não coordena grupo; ver a razão no main.tf.
variable "produtores_arns" {
  type    = list(string)
  default = []
}

variable "topicos_dos_produtores" {
  type    = list(string)
  default = []
}
