variable "tetos_por_dominio" {
  type        = map(string)
  description = "domínio -> teto mensal em dólar; a chave precisa existir na categoria Dominio"

  # Teto é número de negócio, e o primeiro valor dele aqui NÃO é: é o consumo
  # medido com folga, que serve para o alerta existir antes de alguém decidir o
  # orçamento de verdade. Alerta calibrado por medição é pior que alerta
  # calibrado por decisão, e é muito melhor que alerta nenhum.
}

variable "teto_da_organizacao" {
  type        = string
  description = "teto mensal da fatura inteira, em dólar"
}

variable "emails" {
  type        = list(string)
  description = "quem recebe o aviso de previsão e o de estouro"
}

variable "nome_da_categoria" {
  type        = string
  default     = "Dominio"
  description = "nome da categoria de custo que o filtro usa; o valor vira `<nome>$<dominio>`"

  # A API do Budgets endereça valor de categoria como `Nome$valor`, e não por
  # ARN. Se a categoria for renomeada, este prefixo muda junto ou o orçamento
  # passa a medir nada, em silêncio.
}
