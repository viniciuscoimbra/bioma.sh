variable "grants" {
  type = map(object({
    principal_arn = string
    database      = string
    tabela        = string
    permissoes    = list(string) # tipicamente ["SELECT", "DESCRIBE"]
  }))
}
