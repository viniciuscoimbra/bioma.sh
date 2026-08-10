variable "plano" { type = string }
variable "regiao" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

variable "cidr_permitido" { type = string }

variable "servicos" {
  type        = list(string)
  description = "ex.: ecr.api, ecr.dkr, logs, sts, ssm, secretsmanager, kms"
}
