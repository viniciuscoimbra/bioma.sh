variable "permission_sets" {
  type = map(object({
    duracao_sessao   = string # ex.: PT8H
    managed_policies = list(string)

    # Políticas da própria instituição, por nome, que precisam existir em cada
    # conta alvo. Nenhuma política da AWS limita sessão a máquina etiquetada, e
    # é isso que separa acesso de fornecedor de acesso à conta.
    politicas_da_conta = optional(list(string), [])
  }))
}

variable "grupos_proprios" {
  type        = list(string)
  default     = []
  description = "grupos que esta árvore cria no diretório do Identity Center, enquanto não há IdP corporativo"
}

variable "grupos_externos" {
  type        = map(string)
  default     = {}
  description = "nome -> id de grupo que veio do IdP por SCIM; vence o grupo próprio de mesmo nome"
}

variable "atribuicoes" {
  type        = list(object({ conjunto = string, grupo = string, conta = string }))
  description = "grupo × permission set × conta; a matriz de acesso versionada"
}
