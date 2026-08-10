variable "permission_sets" {
  type = map(object({
    duracao_sessao   = string # ex.: PT8H
    managed_policies = list(string)
  }))
}

variable "atribuicoes" {
  type        = list(object({ conjunto = string, grupo_id = string, conta = string }))
  description = "grupo × permission set × conta; a matriz de acesso versionada"
}
