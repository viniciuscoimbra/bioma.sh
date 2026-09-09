# Organismo orcamentos-por-dominio (00): o alerta que chega antes da fatura.
#
# Categoria e rateio respondem "quanto custa o meu domínio" para quem ABRE o
# console. O orçamento responde para quem NÃO abre: ele vigia o mês contra um
# teto e avisa o dono quando a previsão passa dele. Sem isso, o número existe e
# ninguém olha até a fatura chegar, que é tarde para decidir qualquer coisa.
#
# Um orçamento por domínio de negócio, filtrado pela categoria `Dominio`, mais
# um da organização inteira. O filtro por categoria e não por conta é o que faz
# o teto acompanhar o rateio: quando as regras de rateio entram em regime, o
# orçamento do core bancário passa a medir o custo COM a quota de plataforma,
# sem ninguém reescrever número nenhum aqui.

resource "aws_budgets_budget" "dominio" {
  for_each = var.tetos_por_dominio

  name         = "dominio-${each.key}"
  budget_type  = "COST"
  limit_amount = each.value
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # `CostCategory`, singular. A API recusa `CostCategories` e a mensagem lista
  # as dimensões válidas, o que só se descobre aplicando: o plano aceita
  # qualquer string aqui.
  cost_filter {
    name = "CostCategory"
    # `join` e não interpolação: o separador da API é o cifrão, e cifrão dentro
    # de string do Terraform é o começo de uma interpolação. Escapá-lo com `$$`
    # produz o literal `${each.key}` e a AWS recusa com "is not comply with
    # key-value format" — medido em 01/09, aplicando.
    values = [join("$", [var.nome_da_categoria, each.key])]
  }

  # DOIS avisos, e a diferença entre eles é o que os torna úteis.
  #
  # O de 80% olha para o PREVISTO (FORECASTED): ele dispara no meio do mês, com
  # tempo de fazer alguma coisa, e é o único dos dois que serve para decidir.
  # O de 100% olha para o REALIZADO (ACTUAL): ele não previne nada, e existe
  # para o registro de que o teto foi passado de fato, e não por projeção.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.emails
  }
}

# O teto da organização, que é a soma com folga e não a soma dos tetos: domínio
# estourar o dele não é o mesmo evento que a fatura estourar, e confundir os
# dois faz o alerta da fatura disparar toda vez que um domínio cresce.
resource "aws_budgets_budget" "organizacao" {
  name         = "organizacao-inteira"
  budget_type  = "COST"
  limit_amount = var.teto_da_organizacao
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.emails
  }
}
