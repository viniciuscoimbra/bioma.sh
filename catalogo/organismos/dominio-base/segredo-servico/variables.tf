variable "nome" {
  type        = string
  description = "nome do segredo (ex.: <dominio>/<servico>, o mesmo padrão do módulo de secrets-manager do repositório do serviço)"
}

variable "kms_key_arn" {
  type    = string
  default = null
}
