# O mapa nome → id de toda OU da árvore, em qualquer nível. É por ele que a
# célula de conta descobre onde nascer.
output "ous" {
  value = merge(
    { for k, m in module.nivel_1 : k => m.ou_id },
    { for k, m in module.nivel_2 : k => m.ou_id },
    { for k, m in module.nivel_3 : k => m.ou_id },
  )
}
