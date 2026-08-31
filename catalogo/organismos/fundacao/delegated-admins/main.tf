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

# Duas funções vinculadas a serviço que só valem se existirem NA MANAGEMENT, e
# que nenhum dos dois serviços cria sozinho quando quem chama é a conta
# delegada. Sem elas o apply da conta de segurança morre com duas mensagens que
# não se parecem com "falta uma role":
#
#   ConflictException: Access Analyzer Service Linked Role is not in the
#   organizational management account
#
#   BadRequestException: The request failed because you do not have required
#   AWS Organization master permission
#
# A segunda é a mais enganosa: ela aparece só na feature de malware, que é a
# única do GuardDuty que cria recurso na conta-membro (cópia da EBS para
# varredura). As outras features passam, e a leitura fácil é que a delegação
# está pela metade — quando o que falta é esta role, aqui.
resource "aws_iam_service_linked_role" "access_analyzer" {
  aws_service_name = "access-analyzer.amazonaws.com"

  depends_on = [aws_organizations_delegated_administrator.seguranca]
}

resource "aws_iam_service_linked_role" "guardduty_malware" {
  aws_service_name = "malware-protection.guardduty.amazonaws.com"

  depends_on = [aws_guardduty_organization_admin_account.seguranca]
}

# A management é conta como as outras para efeito de detecção, e o piso de
# postura a mede junto com as demais. Mas ela tem uma ordem própria: a AWS só
# a aceita como membro do GuardDuty se ela já tiver o serviço ligado nela
# mesma ("Before the management account gets added as a GuardDuty member, it
# must have GuardDuty enabled"). O registro do administrador liga o GuardDuty
# na conta DELEGADA, não aqui — então aqui é ato próprio.
#
# Não confundir com ser administradora: ela continua sendo apenas medida, e a
# administração segue na conta de segurança, que é onde a AWS recomenda.
resource "aws_guardduty_detector" "management" {
  enable = true
}

resource "aws_guardduty_detector" "management_secundaria" {
  provider = aws.secundaria

  enable = true
}

# O Macie repete a exigência do GuardDuty, com uma mensagem mais direta:
# "your organization master must first enable Macie to be added as a member".
# A conta de gestão precisa do serviço ligado nela antes de a conta delegada
# poder administrá-la, e ligar é ato dela mesma.
resource "aws_macie2_account" "management" {
  status = "ENABLED"
}

resource "aws_macie2_account" "management_secundaria" {
  provider = aws.secundaria

  status = "ENABLED"

  depends_on = [aws_macie2_account.management]
}

# E o analisador de acesso da própria management, pelo mesmo motivo das duas
# acima: o analisador de ORGANIZAÇÃO mora na conta delegada e enxerga as contas
# membro, mas o controle IAM.28 pergunta se ESTA conta tem analisador próprio, e
# a management não é membro de si mesma. Toda conta ganha o dela pelo piso
# (organismos/seguranca/piso-de-conta), e a management é a única sem célula de
# piso — ela é configurada por esta camada, não por aquela. Sem estas duas
# linhas ela ficaria como a única conta vermelha das cinquenta, e o motivo
# pareceria mistério em vez de fronteira.
resource "aws_accessanalyzer_analyzer" "management" {
  analyzer_name = "conta-${data.aws_caller_identity.esta.account_id}"
  type          = "ACCOUNT"
}

resource "aws_accessanalyzer_analyzer" "management_secundaria" {
  provider = aws.secundaria

  analyzer_name = "conta-${data.aws_caller_identity.esta.account_id}"
  type          = "ACCOUNT"
}

# Inspector e Macie repetem o padrão do GuardDuty: registro no Organizations não
# basta, cada um tem o seu ato, e o ato é regional. A diferença é que estes dois
# nem constam da lista de `servicos_de_seguranca` — para eles o Organizations
# não é o caminho, e a delegação é chamada do próprio serviço.
resource "aws_inspector2_delegated_admin_account" "seguranca" {
  account_id = var.conta_seguranca
}

resource "aws_inspector2_delegated_admin_account" "seguranca_secundaria" {
  provider = aws.secundaria

  account_id = var.conta_seguranca

  # O Inspector recusa duas mudanças ao mesmo tempo NA MESMA CONTA, mesmo que
  # sejam em regiões diferentes: `ConflictException: Multiple changes cannot be
  # done at the same time`. O Terraform não tem como saber disso, porque para
  # ele são dois recursos independentes em dois provedores. A aresta é
  # artificial de propósito — existe para serializar, não porque um dependa do
  # outro.
  depends_on = [aws_inspector2_delegated_admin_account.seguranca]
}

resource "aws_macie2_organization_admin_account" "seguranca" {
  admin_account_id = var.conta_seguranca
}

resource "aws_macie2_organization_admin_account" "seguranca_secundaria" {
  provider = aws.secundaria

  admin_account_id = var.conta_seguranca

  # Mesma serialização do Inspector acima, pela mesma razão e por precaução: os
  # dois serviços delegam para a mesma conta, e a chamada de um pode encontrar a
  # do outro em curso.
  depends_on = [
    aws_macie2_organization_admin_account.seguranca,
    aws_inspector2_delegated_admin_account.seguranca_secundaria,
  ]
}

data "aws_caller_identity" "esta" {}
