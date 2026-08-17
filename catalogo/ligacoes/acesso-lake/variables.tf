variable "grants" {
  type = map(object({
    principal_arn = string
    database      = string
    tabela        = string
    permissoes    = list(string) # tipicamente ["SELECT", "DESCRIBE"]
  }))
  default = {}
}

variable "grants_por_tag" {
  type = map(object({
    principal_arn = string
    tipo          = string            # DATABASE ou TABLE
    expressao     = map(list(string)) # LF-Tag => valores; ex.: { dominio = ["<dominio>"], classificacao = ["publico", "interno"] }
    permissoes    = list(string)
    catalog_id    = optional(string, null) # a conta dona das tags, quando não é a de quem concede
  }))
  default     = {}
  description = "grant por expressão de LF-Tags: o que o contrato de dado compila; escala com produtos, não com tabelas"
  validation {
    condition     = alltrue([for g in var.grants_por_tag : contains(["DATABASE", "TABLE"], g.tipo)])
    error_message = "tipo do grant por tag é DATABASE ou TABLE."
  }
}

variable "filtros_de_linha" {
  type = map(object({
    principal_arn = string
    catalog_id    = string # a conta dona da tabela
    database      = string
    tabela        = string
    predicado     = string # ex.: uf = 'SP'; o contrato declara
    colunas       = optional(list(string), null)
  }))
  default     = {}
  description = "Data Cells Filters: o predicado de linha (e o recorte de coluna) do contrato, com o SELECT concedido sobre o filtro"
}
