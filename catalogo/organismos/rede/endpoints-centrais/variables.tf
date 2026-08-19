variable "plano" { type = string }
variable "regiao" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

variable "cidr_permitido" { type = string }

# O plano de rota pode ter mais de uma supernet, e o Transit Gateway não traduz
# endereço: quem chega dos outros lados chega com o endereço da própria
# supernet, e um grupo de um CIDR só derruba o pacote. Aditiva de propósito:
# nenhuma instalação existente muda ao adotá-la.
variable "cidrs_permitidos" {
  type    = list(string)
  default = []
}

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
