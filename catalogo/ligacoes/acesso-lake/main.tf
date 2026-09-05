# Ligação acesso-lake (04, 04.1): grant do Lake Formation concedido pelo DONO
# do produto de dado ao principal consumidor. O consumidor nunca se concede;
# a plataforma nunca concede por ele (posse do Data Mesh).
#
# Três formas de conceder, e o contrato de dado compila para elas (04 ·
# Decisão 2): por tabela nomeada (o grant simples), por LF-Tag (a expressão de
# tags casa tabela e coluna, e é o que escala com o número de produtos) e por
# filtro de linha (Data Cells Filter: o predicado que o contrato declara). O
# principal pode ser de outra conta: o Lake Formation cria o share pelo RAM
# sozinho, e do lado de lá falta só o resource link (ligação link-catalogo).

resource "aws_lakeformation_permissions" "grant" {
  for_each = var.grants

  principal   = each.value.principal_arn
  permissions = each.value.permissoes

  # `tabela = "*"` é o curinga do LF (todas as tabelas do database, inclusive
  # as que ainda vão nascer): é o que um sink que CRIA tabelas precisa, porque
  # no primeiro commit a tabela não existe para ser nomeada.
  table {
    database_name = each.value.database
    name          = each.value.tabela == "*" ? null : each.value.tabela
    wildcard      = each.value.tabela == "*" ? true : null
  }
}

# Grant no DATABASE, e não na tabela: CREATE_TABLE, DESCRIBE e ALTER do banco
# são o que um escritor de lake precisa antes da primeira tabela existir. Com
# o LF governando o catálogo (IAM_ALLOWED_PRINCIPALS vazio na governança), o
# sink Iceberg morria em "Insufficient Lake Formation permission(s): Required
# Describe on ledger_lancamento_v1" ao tentar criar a tabela (medido em
# 2026-09-05 no sink de produção).
resource "aws_lakeformation_permissions" "grant_de_database" {
  for_each = var.grants_de_database

  principal   = each.value.principal_arn
  permissions = each.value.permissoes

  database {
    name = each.value.database
  }
}

# Grant no CATÁLOGO (CREATE_DATABASE): o sink Iceberg do Kafka Connect chama
# createNamespace SEMPRE, sem conferir se o database existe, e engole só
# AlreadyExists e Forbidden (createNamespaceIfNotExist, iceberg 1.9.2). Com o
# IAM negando glue:CreateDatabase o erro é AccessDenied, que ele não engole, e
# a tarefa morre com o database já existindo (medido em 2026-09-05 em
# produção). A permissão precisa existir nas duas pontas para a chamada chegar
# ao "já existe".
resource "aws_lakeformation_permissions" "grant_de_catalogo" {
  for_each = var.grants_de_catalogo

  principal        = each.value.principal_arn
  permissions      = each.value.permissoes
  catalog_resource = true
}

resource "aws_lakeformation_permissions" "por_tag" {
  for_each = var.grants_por_tag

  principal   = each.value.principal_arn
  permissions = each.value.permissoes

  lf_tag_policy {
    resource_type = each.value.tipo # DATABASE ou TABLE
    catalog_id    = each.value.catalog_id
    dynamic "expression" {
      for_each = each.value.expressao
      content {
        key    = expression.key
        values = expression.value
      }
    }
  }
}

# O filtro de linha nasce na tabela do dono, e o grant sobre ele é o que o
# consumidor recebe: sem grant no filtro, o filtro é só uma definição.
resource "aws_lakeformation_data_cells_filter" "filtro" {
  for_each = var.filtros_de_linha

  table_data {
    database_name    = each.value.database
    table_name       = each.value.tabela
    name             = each.key
    table_catalog_id = each.value.catalog_id

    row_filter {
      filter_expression = each.value.predicado
    }

    # sem lista de colunas o filtro é só de linha; com ela é de linha e coluna
    column_names = each.value.colunas
  }
}

resource "aws_lakeformation_permissions" "por_filtro" {
  for_each = var.filtros_de_linha

  principal   = each.value.principal_arn
  permissions = ["SELECT"]

  data_cells_filter {
    database_name    = each.value.database
    table_name       = each.value.tabela
    name             = each.key
    table_catalog_id = each.value.catalog_id
  }

  depends_on = [aws_lakeformation_data_cells_filter.filtro]
}
