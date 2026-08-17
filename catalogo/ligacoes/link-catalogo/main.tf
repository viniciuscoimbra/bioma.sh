# Ligação link-catalogo (04.1 §4): o resource link no catálogo da conta
# consumidora, apontando o banco do produtor. O grant do Lake Formation entre
# contas cria o share pelo RAM, mas o banco só aparece para o Athena e o
# Redshift do consumidor quando existe um link local com o mesmo nome. Quem
# consome cria o link; o dado continua onde nasceu.

resource "aws_glue_catalog_database" "link" {
  for_each = var.links

  name = each.key

  target_database {
    catalog_id    = each.value.conta_dona
    database_name = each.value.database
    region        = each.value.regiao
  }
}
