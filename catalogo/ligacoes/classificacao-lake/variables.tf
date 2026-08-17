variable "catalog_id" {
  type        = string
  description = "a conta dona do catálogo classificado (a conta do domínio produtor)"
}

variable "tags_catalog_id" {
  type        = string
  description = "a conta dona do vocabulário de LF-Tags (a conta de dados da plataforma, que as compartilha por grant); quando o vocabulário é local, a própria conta"
}

variable "bancos" {
  type        = map(map(string)) # nome do banco => { tag => valor }
  default     = {}
  description = "tags do banco inteiro; a tabela herda o que não redeclara"
}

variable "tabelas" {
  type = map(object({
    database = string
    tabela   = string
    tags     = map(string)
  }))
  default = {}
}

variable "colunas" {
  type = map(object({
    database = string
    tabela   = string
    colunas  = list(string)
    tags     = map(string) # ex.: { classificacao = "pii" }
  }))
  default     = {}
  description = "o recorte por coluna: é aqui que pii e restrito entram, coluna a coluna, do contrato"
}
