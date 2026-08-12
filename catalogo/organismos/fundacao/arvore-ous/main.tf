# Organismo arvore-ous: os territórios (00·D1), compostos da molécula
# ou-registrada. Registro roda uma OU por vez: aplicar com -parallelism=1.
#
# Três níveis, que é a profundidade da árvore aprovada:
#   nível 1  Security, Infrastructure, Platform, Workloads, Sandbox
#   nível 2  CIAM sob Security; os domínios sob Workloads
#   nível 3  Mesa de Credito e Core de Credito sob Credito;
#            Canal Cliente e Canal Parceiro sob Canais
# Terraform não recursiona módulo, então cada nível é um bloco que aponta o
# anterior. Quarto nível exigiria bloco novo, e a árvore não tem.

module "nivel_1" {
  source   = "../../../moleculas/ou-registrada"
  for_each = var.ous_nivel_1

  nome                         = each.key
  parent_id                    = var.root_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}

module "nivel_2" {
  source   = "../../../moleculas/ou-registrada"
  for_each = var.ous_nivel_2

  # O nível inteiro antes do próximo, e não só a OU-mãe de cada filha: o
  # `parent_id` amarra a criação da OU, e não a do registro. A API do Control
  # Tower recusa habilitar o baseline numa OU cujo pai ainda não o tem, e o
  # Terraform, livre para ordenar recursos independentes, começava pelas filhas.
  depends_on = [module.nivel_1]

  nome                         = each.key
  parent_id                    = module.nivel_1[each.value.pai].ou_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}

module "nivel_3" {
  source   = "../../../moleculas/ou-registrada"
  for_each = var.ous_nivel_3

  depends_on = [module.nivel_2]

  nome                         = each.key
  parent_id                    = module.nivel_2[each.value.pai].ou_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}
