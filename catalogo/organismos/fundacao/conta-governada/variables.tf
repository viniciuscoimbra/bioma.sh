variable "nome" { type = string }
variable "email" { type = string }
variable "ou_id" { type = string }

variable "tags_alocacao" {
  type        = map(string)
  description = "custo por domínio e ambiente; tag de billing não é retroativa (00·D6)"
}

variable "contatos" {
  type    = map(object({ nome = string, titulo = string, email = string, telefone = string }))
  default = {}
}
