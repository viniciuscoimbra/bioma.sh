# Organismo quality-gate (04): regras DQDL sobre as tabelas do produto. O
# resultado reprova a publicação (o job lê o veredito antes de expor); regra
# nova é PR na receita, com o dono do produto revisando.

resource "aws_glue_data_quality_ruleset" "regras" {
  for_each = var.regras

  name    = "${var.dominio}-${each.key}"
  ruleset = each.value.dqdl

  target_table {
    database_name = each.value.database
    table_name    = each.value.tabela
  }
}
