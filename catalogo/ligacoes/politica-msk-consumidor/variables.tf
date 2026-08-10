variable "sufixo" { type = string }
variable "role_name" { type = string }
variable "cluster_arn" { type = string }
variable "vpc_connection_arn" { type = string }
variable "topicos_arns" { type = list(string) }
variable "grupos_arns" { type = list(string) }
