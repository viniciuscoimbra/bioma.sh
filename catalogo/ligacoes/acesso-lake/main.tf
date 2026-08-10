# Ligação acesso-lake (04, 04.1): grant do Lake Formation concedido pelo DONO
# do produto de dado ao principal consumidor. O consumidor nunca se concede;
# a plataforma nunca concede por ele (posse do Data Mesh).

resource "aws_lakeformation_permissions" "grant" {
  for_each = var.grants

  principal   = each.value.principal_arn
  permissions = each.value.permissoes

  table {
    database_name = each.value.database
    name          = each.value.tabela
  }
}
