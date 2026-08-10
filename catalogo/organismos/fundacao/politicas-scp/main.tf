# Organismo politicas-scp: definição, canário e promoção (guia §5). A negação
# de região NÃO está aqui: o caminho provável é o controle gerenciado
# CT.MULTISERVICE.PV.1, pendente de validação em sandbox (guia §4).

module "politica" {
  source   = "../../../moleculas/scp"
  for_each = var.politicas

  nome        = each.key
  descricao   = each.value.descricao
  policy_json = each.value.policy_json
  targets = merge(
    { for i, t in each.value.canario : "canario-${i}" => t },
    { for i, t in each.value.producao : "prod-${i}" => t },
  )
}
