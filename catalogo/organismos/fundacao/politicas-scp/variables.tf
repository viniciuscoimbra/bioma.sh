variable "politicas" {
  type = map(object({
    descricao   = string
    policy_json = string
    canario     = list(string) # id da OU canário; o teste operacional é o gate
    producao    = list(string) # promoção em PR próprio, com a evidência do canário
  }))
}
