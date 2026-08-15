variable "plano" { type = string }
variable "regiao" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

variable "cidr_permitido" { type = string }

variable "servicos" {
  type        = list(string)
  description = "ex.: ecr.api, ecr.dkr, logs, sts, ssm, secretsmanager, kms"
}

# As VPCs que recebem autorização para associar as zonas de resolução central.
# Vazio autoriza ninguém, e é assim que uma instalação sem consumidor nasce.
variable "vpcs_consumidoras" {
  type    = list(string)
  default = []
}
