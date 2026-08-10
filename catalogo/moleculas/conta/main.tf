# Molécula conta: uma conta AWS governada. Encerramento só por workflow próprio:
# prevent_destroy morre com o bloco, então a política de esteira proíbe remover
# esta unit, rodar state rm ou mudar close_on_deletion (catálogo §11).

resource "aws_organizations_account" "esta" {
  name              = var.nome
  email             = var.email
  parent_id         = var.ou_id
  close_on_deletion = false
  role_name         = var.role_de_acesso
  tags              = var.tags

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [role_name] # a AWS não devolve; diff perpétuo se comparado
  }
}

resource "aws_account_alternate_contact" "contatos" {
  for_each = var.contatos

  account_id             = aws_organizations_account.esta.id
  alternate_contact_type = each.key # BILLING | OPERATIONS | SECURITY
  name                   = each.value.nome
  title                  = each.value.titulo
  email_address          = each.value.email
  phone_number           = each.value.telefone
}
