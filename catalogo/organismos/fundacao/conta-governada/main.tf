# Organismo conta-governada: uma conta por unit (guia §3 camada 3): state e
# aprovação isolados, falha localizada. A conclusão deste apply NÃO significa
# conta pronta: o enrollment é assíncrono e o gate da esteira confere por
# ListEnabledBaselines --include-children antes de qualquer OIDC ou recurso.

module "conta" {
  source = "../../../moleculas/conta"

  nome     = var.nome
  email    = var.email
  ou_id    = var.ou_id
  tags     = merge(var.tags_alocacao, { nome = var.nome })
  contatos = var.contatos
}
