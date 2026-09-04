# O prefixo do nome do balde. Nome de balde é global na AWS, e o prefixo é o que
# separa uma instituição de outra: escrito no catálogo, ele leva a sigla de um
# cliente para dentro do produto, e a segunda instalação colide com a primeira.
variable "prefixo" {
  type = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,20}$", var.prefixo))
    error_message = "Prefixo em minúsculas, de 2 a 21 caracteres: ele entra em nome de balde."
  }
}

variable "conta" { type = string }

# vazio mantém o nome que o balde já tem; ver a razão no main.tf
variable "sufixo" {
  type    = string
  default = ""
}
variable "kms_key_arn" { type = string }

variable "roles_leitoras" {
  type        = list(string)
  default     = []
  description = "as roles que leem o artefato, uma a uma; nem a Organization nem a conta inteira entram aqui"
}

variable "prefixos_leitura" {
  type        = list(string)
  default     = ["conectores/*"]
  description = "o que as contas leitoras alcançam dentro do balde; sem isto elas leriam tudo"
}

variable "dias_versao_antiga" {
  type        = number
  default     = 90
  description = "por quantos dias a versão anterior de um artefato sobrevive"
}
