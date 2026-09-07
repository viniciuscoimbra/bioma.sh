# Organismo arvore-ous: os territórios (00·D1), compostos da molécula
# ou-registrada. Registro roda uma OU por vez: aplicar com -parallelism=1.
#
# A ÁRVORE VEM NUMA DECLARAÇÃO SÓ, com `pai`, e a profundidade sai do dado.
# Antes quem chamava declarava `ous_nivel_1`, `ous_nivel_2` e `ous_nivel_3`, e
# o nível ficava chumbado na ficha: a árvore de OUs é definição de negócio e
# tem a forma que o negócio tem.
#
# Terraform não recursiona módulo, então a profundidade se calcula aqui e cada
# nível continua sendo um bloco que aponta o anterior. Cinco blocos, que é o
# que a AWS Organizations aninha; o sexto a própria AWS recusa, e a validação
# do `variables.tf` diz isso antes de o apply começar.
#
# Os endereços de módulo (`module.nivel_1[...]`) são os mesmos de antes DE
# PROPÓSITO: mudar o endereço faria o Terraform planejar destruir e recriar a
# OU, e OU com conta dentro não se destrói. A mudança é na ficha, e o estado
# não sente.

locals {
  # profundidade por passe, e não por recursão: o nível de uma OU é um a mais
  # que o do pai dela.
  _n1 = { for k, v in var.ous : k => v if v.pai == null }
  _n2 = { for k, v in var.ous : k => v if v.pai != null && contains(keys(local._n1), v.pai) }
  _n3 = { for k, v in var.ous : k => v if v.pai != null && contains(keys(local._n2), v.pai) }
  _n4 = { for k, v in var.ous : k => v if v.pai != null && contains(keys(local._n3), v.pai) }
  _n5 = { for k, v in var.ous : k => v if v.pai != null && contains(keys(local._n4), v.pai) }

  # onde cada OU já criada mora, para o nível seguinte apontar o pai dele sem
  # saber em que bloco ele nasceu
  _ids = merge(
    { for k, m in module.nivel_1 : k => m.ou_id },
    { for k, m in module.nivel_2 : k => m.ou_id },
    { for k, m in module.nivel_3 : k => m.ou_id },
    { for k, m in module.nivel_4 : k => m.ou_id },
  )
}

module "nivel_1" {
  source   = "../../../moleculas/ou-registrada"
  for_each = local._n1

  nome                         = each.key
  parent_id                    = var.root_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}

module "nivel_2" {
  source   = "../../../moleculas/ou-registrada"
  for_each = local._n2

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
  for_each = local._n3

  depends_on = [module.nivel_2]

  nome                         = each.key
  parent_id                    = module.nivel_2[each.value.pai].ou_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}

module "nivel_4" {
  source   = "../../../moleculas/ou-registrada"
  for_each = local._n4

  depends_on = [module.nivel_3]

  nome                         = each.key
  parent_id                    = module.nivel_3[each.value.pai].ou_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}

module "nivel_5" {
  source   = "../../../moleculas/ou-registrada"
  for_each = local._n5

  depends_on = [module.nivel_4]

  nome                         = each.key
  parent_id                    = module.nivel_4[each.value.pai].ou_id
  registrar                    = each.value.registrar
  baseline_identifier          = var.baseline_identifier
  identity_center_baseline_arn = var.identity_center_baseline_arn
}
