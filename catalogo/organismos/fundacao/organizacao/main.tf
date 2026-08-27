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

  # A lista é fechada: o que não estiver aqui o Terraform desabilita. Numa
  # Organization adotada isso é a diferença entre descrever e destruir, e o
  # primeiro plano contra a conta real pediu para tirar dois que já estavam
  # ligados. `iam` sustenta papel vinculado a serviço em toda a Organization, e
  # o hub de custo é ligado pela própria AWS em conta nova: nenhum dos dois foi
  # decisão de alguém, e desligar seria regressão silenciosa.
  #
  # Os dois últimos são do Control Tower, e entram depois dele: o Config
  # ligado antes faz a pré-checagem recusar a configuração inteira, e os stack
  # sets em conta-membro nem existem antes da landing zone. Ver
  # `landing_zone_de_pe`.
  #
  # `ipam.amazonaws.com` entra pelo mesmo motivo dos dois primeiros, e por um
  # caminho que não passa por aqui: quem o liga é o EC2, ao delegar o IPAM para
  # a conta de rede (`enable-ipam-organization-admin-account`). Fora da lista,
  # o plano seguinte propõe desligá-lo, e desligar o acesso confiável do IPAM
  # é tirar o chão dos pools que a rede inteira endereça.
  aws_service_access_principals = concat([
    "account.amazonaws.com",
    "cost-optimization-hub.bcm.amazonaws.com",
    "iam.amazonaws.com",
    "ipam.amazonaws.com",
    "controltower.amazonaws.com",
    "sso.amazonaws.com",
    "cloudtrail.amazonaws.com",
    "ram.amazonaws.com",
    "backup.amazonaws.com",
    "securityhub.amazonaws.com",
    "guardduty.amazonaws.com",
    # O Access Analyzer entra aqui, e não só na lista de delegação: o
    # Organizations recusa `RegisterDelegatedAdministrator` com
    # ConstraintViolationException enquanto o acesso confiável não existe
    # ("You must enable service access before you delegate an administrator").
    # São dois atos, e a receita de delegação sozinha não alcança este.
    "access-analyzer.amazonaws.com",
    # A varredura de malware do GuardDuty é serviço à parte do GuardDuty, com
    # principal próprio. Sem ele, a configuração de organização aceita cinco
    # features e recusa só esta, com "you do not have required AWS Organization
    # master permission" — mensagem que fala de permissão e esconde que o que
    # falta é acesso confiável.
    "malware-protection.guardduty.amazonaws.com",
    ], var.landing_zone_de_pe ? [
    "config.amazonaws.com",
    "member.org.stacksets.cloudformation.amazonaws.com",
  ] : [])

  lifecycle { prevent_destroy = true }
}

# As credenciais de root das contas-membro, centralizadas na management. Sem
# isto cada conta nasce com um root próprio, com recuperação de senha por
# e-mail e MFA para gerir uma a uma: quarenta e sete contas viram quarenta e
# sete credenciais de poder total, cada uma capaz de desfazer toda SCP que
# desce por cima dela, e nenhuma delas federada. Com isto a AWS não cria
# credencial de root em conta nova, a management apaga a das que já têm, e a
# tarefa que ainda exige root sai por sessão curta e auditada.
#
# As duas features andam em par. `RootCredentialsManagement` é poder apagar a
# credencial; `RootSessions` é conseguir fazer sem ela o que só o root faz.
# Apagar sem sessão tira a saída de emergência; sessão sem apagar deixa a
# credencial de pé. Quem quiser uma só declara uma, e a declaração fica no diff.
#
# Depende do acesso confiável de `iam.amazonaws.com`, na lista acima.
resource "aws_iam_organizations_features" "root" {
  count = length(var.features_de_root) > 0 ? 1 : 0

  enabled_features = var.features_de_root

  depends_on = [aws_organizations_organization.esta]
}
