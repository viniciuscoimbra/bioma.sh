# Organismo organizacao: só a Organization, num state exclusivo (guia §8).
# Contas compartilhadas, Security OU, roles e chave raiz são da landing-zone,
# dona única de tudo que a LZ toca.

resource "aws_organizations_organization" "esta" {
  feature_set = "ALL"

  enabled_policy_types = [
    "SERVICE_CONTROL_POLICY",
    "TAG_POLICY",
    "BACKUP_POLICY",
  ]

  aws_service_access_principals = [
    "account.amazonaws.com",
    "controltower.amazonaws.com",
    "sso.amazonaws.com",
    "config.amazonaws.com",
    "cloudtrail.amazonaws.com",
    "ram.amazonaws.com",
    "backup.amazonaws.com",
    "securityhub.amazonaws.com",
    "guardduty.amazonaws.com",
  ]

  lifecycle { prevent_destroy = true }
}
