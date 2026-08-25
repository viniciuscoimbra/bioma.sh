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

# Quem pertence a cada grupo, pelo nome de usuário do diretório. Grupo é o que
# a atribuição concede, e grupo vazio concede a ninguém: a receita criava o
# grupo e não tinha como pôr gente dentro, então toda atribuição a ele nascia
# inerte, sem erro nenhum no plano nem no apply.
#
# O usuário é PROCURADO, e não criado. Quem já entrou pelo console existe no
# diretório, e criá-lo de novo pararia o apply com entidade duplicada; quem
# vier do IdP por SCIM também já existe quando esta célula roda. O que a árvore
# governa é o vínculo, que é o que a revisão de acesso lê.
variable "membros" {
  type        = map(list(string))
  default     = {}
  description = "grupo -> nomes de usuário do diretório que pertencem a ele"
}
