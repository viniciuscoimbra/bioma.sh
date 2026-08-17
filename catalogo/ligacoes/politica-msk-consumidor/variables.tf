variable "sufixo" { type = string }
variable "role_name" { type = string }
variable "cluster_arn" { type = string }
variable "vpc_connection_arn" {
  type        = string
  default     = ""
  description = "a conexão multi-VPC do consumidor, quando ele entra por ela (ESM); vazio para quem alcança o cluster pelo hub, como o conector do MSK Connect"
}
variable "topicos_arns" { type = list(string) }
variable "grupos_arns" { type = list(string) }
