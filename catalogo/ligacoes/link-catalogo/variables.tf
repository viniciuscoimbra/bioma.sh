variable "links" {
  type = map(object({
    conta_dona = string # a conta do domínio produtor
    database   = string # o banco lá
    regiao     = string
  }))
  description = "nome do link local => banco de origem em outra conta"
}
