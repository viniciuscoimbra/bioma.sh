# célula: folha-um/prd/kafka-cluster
# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a
# parte sua: responda pela tela, ou escreva o valor aqui mesmo.
include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  # no live real: git::<catalogo>//organismos/folha-um/kafka-cluster?ref=<tag do catalogo.hcl>
  source = "../../../catalogo//organismos/folha-um/kafka-cluster"
}

inputs = {
  nome     = "kafka-cluster"
  ambiente = "prd"
}
