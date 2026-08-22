# Ligação classificacao-lake (04 · Decisão 2 e 3): a atribuição de LF-Tags a
# banco, tabela e coluna, compilada do contrato de dado. É o ato do DONO do
# produto sobre o próprio catálogo: a plataforma define o vocabulário
# (governanca), o domínio classifica o que publica, e o grant por tag
# (acesso-lake) só enxerga o que foi classificado. O detector de PII propõe; a
# tag só entra aqui depois do PR aprovado.

# O vocabulário local, quando o recurso mora fora da conta de dados: a tag tem
# de viver no MESMO catálogo do recurso (regra da AWS, não escolha nossa), e é
# esta receita que a cria, com os mesmos valores que a governanca declara.
resource "aws_lakeformation_lf_tag" "vocabulario" {
  for_each = var.vocabulario

  key    = each.key
  values = each.value
}

resource "aws_lakeformation_resource_lf_tags" "banco" {
  for_each = var.bancos

  database {
    name       = each.key
    catalog_id = var.catalog_id
  }

  dynamic "lf_tag" {
    for_each = each.value
    content {
      key        = lf_tag.key
      value      = lf_tag.value
      catalog_id = var.tags_catalog_id
    }
  }

  depends_on = [aws_lakeformation_lf_tag.vocabulario]
}

resource "aws_lakeformation_resource_lf_tags" "tabela" {
  for_each = var.tabelas

  table {
    database_name = each.value.database
    name          = each.value.tabela
    catalog_id    = var.catalog_id
  }

  dynamic "lf_tag" {
    for_each = each.value.tags
    content {
      key        = lf_tag.key
      value      = lf_tag.value
      catalog_id = var.tags_catalog_id
    }
  }
}

resource "aws_lakeformation_resource_lf_tags" "colunas" {
  for_each = var.colunas

  table_with_columns {
    database_name = each.value.database
    name          = each.value.tabela
    column_names  = each.value.colunas
    catalog_id    = var.catalog_id
  }

  dynamic "lf_tag" {
    for_each = each.value.tags
    content {
      key        = lf_tag.key
      value      = lf_tag.value
      catalog_id = var.tags_catalog_id
    }
  }
}
