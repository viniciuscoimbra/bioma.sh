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
  # O Config entra por último, e não junto: o Control Tower recusa a
  # configuração inteira quando acha o trusted access dele ligado antes, e o
  # erro chega como "seu ambiente não está pronto" na tela do console, sem
  # dizer que quem ligou foi esta lista. Ver `config_da_organizacao_ligado`.
  aws_service_access_principals = concat([
    "account.amazonaws.com",
    "cost-optimization-hub.bcm.amazonaws.com",
    "iam.amazonaws.com",
    "controltower.amazonaws.com",
    "sso.amazonaws.com",
    "cloudtrail.amazonaws.com",
    "ram.amazonaws.com",
    "backup.amazonaws.com",
    "securityhub.amazonaws.com",
    "guardduty.amazonaws.com",
  ], var.config_da_organizacao_ligado ? ["config.amazonaws.com"] : [])

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
