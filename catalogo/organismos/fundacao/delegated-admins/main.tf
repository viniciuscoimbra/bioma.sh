# Organismo delegated-admins: o ato da management (guia §7). O registro parte
# daqui; a configuração de cada serviço roda depois, na conta delegada, por
# outra unit com outra credencial.

resource "aws_organizations_delegated_administrator" "seguranca" {
  for_each = toset(var.servicos_de_seguranca)

  account_id        = var.conta_seguranca
  service_principal = each.value
}

resource "aws_organizations_delegated_administrator" "identidade" {
  account_id        = var.conta_identidade
  service_principal = "sso.amazonaws.com"
}
