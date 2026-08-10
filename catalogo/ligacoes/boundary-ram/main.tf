# Ligação boundary-ram: só share, association e principal (round 3 do estresse:
# quem publica cria o recurso; esta ligação nunca cria o que compartilha).

resource "aws_ram_resource_share" "este" {
  name                      = var.nome
  allow_external_principals = false
}

resource "aws_ram_resource_association" "recursos" {
  for_each = toset(var.resource_arns)

  resource_arn       = each.value
  resource_share_arn = aws_ram_resource_share.este.arn
}

resource "aws_ram_principal_association" "principais" {
  for_each = toset(var.principals)

  principal          = each.value # a OU inteira, não conta a conta
  resource_share_arn = aws_ram_resource_share.este.arn
}
