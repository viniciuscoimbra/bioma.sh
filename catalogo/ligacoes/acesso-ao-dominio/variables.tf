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
    grupo          = string
    # Preenchido quando o grupo vem do IdP corporativo por SCIM; nulo faz esta
    # ligação criar o grupo no diretório do próprio Identity Center.
    grupo_id              = optional(string)
    politicas_gerenciadas = optional(list(string), [])
    # Por nome, e vindo do output de quem cria a política. Nome digitado aqui é
    # o que quebra calado quando a peça muda.
    politicas_da_conta = optional(list(string), [])
  }))
}
