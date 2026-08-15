# célula: faturamento/hml/aurora-cluster
# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a
# parte sua: responda pela tela, ou escreva o valor aqui mesmo.
include "root" {
  path   = find_in_parent_folders("root.hcl")
  expose = true
}

terraform {
  # no live real: git::<catalogo>//organismos/faturamento/aurora-cluster?ref=<tag do catalogo.hcl>
  source = "../../../../catalogo//organismos/faturamento/aurora-cluster"
}


inputs = {
  nome     = "aurora-cluster"
  ambiente = "hml"
  rds_cluster_engine                     = "PREENCHER" # O valor de rds cluster engine
  rds_cluster_instance_engine            = "PREENCHER" # O valor de rds cluster instance engine
  rds_cluster_instance_instance_class    = "PREENCHER" # O valor de rds cluster instance instance class
  db_subnet_group_subnet_ids             = "PREENCHER" # O valor de db subnet group subnet ids
}
