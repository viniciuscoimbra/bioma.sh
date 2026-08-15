variable "ambiente" { type = string }
variable "pacote_inicial" { type = string }
variable "kms_key_arn" { type = string }
variable "cluster_arn" { type = string }
variable "topicos" { type = list(string) }
variable "definicao_asl" { type = string }

variable "funcoes_passos_arns" {
  type    = list(string)
  default = ["*"]
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
