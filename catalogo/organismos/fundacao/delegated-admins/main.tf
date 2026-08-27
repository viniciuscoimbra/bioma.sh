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

# O IPAM não delega pelo Organizations: a delegação dele é ato do EC2, e sem
# ela o IPAM da conta de rede é solitário — só monitora a própria conta, e
# alocar CIDR de outra conta morre com "Account X is not monitored by IPAM",
# mesmo com o pool compartilhado por RAM. O texto da fase prometia esta
# delegação e o código não a fazia.
resource "aws_vpc_ipam_organization_admin_account" "rede" {
  count = var.conta_rede != "" ? 1 : 0

  delegated_admin_account_id = var.conta_rede
}

# O GuardDuty não se contenta com o registro do Organizations: como o IPAM
# acima, ele tem um ato próprio. `list-delegated-services-for-account` já
# devolvia `guardduty.amazonaws.com` para a conta de segurança, e
# `guardduty list-organization-admin-accounts` devolvia vazio nas duas regiões
# — a delegação existia no papel e não existia no serviço, e nenhuma das duas
# APIs reclamava. É a mesma classe de defeito que o comentário do IPAM
# descreve, e ela custou noventa e oito reprovações de GuardDuty.1.
#
# O registro é regional: a AWS exige a MESMA conta administradora em toda
# região onde o GuardDuty roda, e a SCP da fundação já tranca a organização em
# duas (residência e réplica). Por isso duas declarações, não uma.
resource "aws_guardduty_organization_admin_account" "seguranca" {
  admin_account_id = var.conta_seguranca

  depends_on = [aws_organizations_delegated_administrator.seguranca]
}

resource "aws_guardduty_organization_admin_account" "seguranca_secundaria" {
  provider = aws.secundaria

  admin_account_id = var.conta_seguranca

  depends_on = [aws_organizations_delegated_administrator.seguranca]
}
