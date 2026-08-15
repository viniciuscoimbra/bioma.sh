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

# Contatos alternativos de faturamento, operação e segurança. Nascem vazios de
# propósito: a conta é configurada por quem constrói e entregue a quem opera, e
# contato é da instituição que responde pela conta, não de quem a montou. Pôr
# aqui o contato de quem constrói significaria que a AWS avisa a pessoa errada
# num incidente de segurança, e que trocar depois é visitar 47 contas.
#
# A instituição preenche ao receber a conta configurada. Enquanto `contatos`
# estiver vazio, este bloco não cria nada, e é assim que tem de ser.
resource "aws_account_alternate_contact" "contatos" {
  for_each = var.contatos

  account_id             = aws_organizations_account.esta.id
  alternate_contact_type = each.key # BILLING | OPERATIONS | SECURITY
  name                   = each.value.nome
  title                  = each.value.titulo
  email_address          = each.value.email
  phone_number           = each.value.telefone
}
