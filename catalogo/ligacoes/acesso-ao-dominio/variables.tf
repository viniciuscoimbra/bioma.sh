variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "conta" {
  type        = string
  description = "a conta onde as políticas existem e o acesso vale"
}

variable "conjuntos" {
  type = map(object({
    duracao_sessao = string
    descricao      = string
    # Um conjunto pode servir a mais de um grupo: sessão gravada vale igual
    # para quem instala o produto e para quem opera o domínio.
    grupos                = list(string)
    politicas_gerenciadas = optional(list(string), [])
    # Por nome, e vindo do output de quem cria a política. Nome digitado aqui é
    # o que quebra calado quando a peça muda.
    politicas_da_conta = optional(list(string), [])
  }))
}

variable "grupos_externos" {
  type        = map(string)
  default     = {}
  description = "nome -> id de grupo que veio do IdP por SCIM; vence o grupo criado aqui"
}

variable "pessoas" {
  type = map(object({
    nome          = string
    primeiro_nome = string
    sobrenome     = string
    email         = string
    grupos        = list(string)
  }))
  default     = {}
  description = "quem entra, enquanto não há IdP corporativo; com SCIM isto fica vazio"
}
