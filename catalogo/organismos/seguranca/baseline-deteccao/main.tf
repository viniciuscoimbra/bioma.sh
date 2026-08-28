# Organismo baseline-deteccao (00·D5, 03·D6): roda NA CONTA DELEGADA de
# segurança, depois do registro em delegated-admins. Não recria recorder,
# aggregator nem trail do Control Tower (guia §3 camada 2): consome-os. O que
# o CT não possui entra aqui: Security Hub em configuração central e o
# agregador de findings.

# `ALL_REGIONS` parece a escolha segura e é a cara: ele agrega achado de toda
# região que a AWS abrir, inclusive as que a instituição proibiu por SCP. O
# resultado não é mais cobertura, é ruído com selo de CRITICAL — conta que não
# pode criar recurso numa região é reprovada por não ter Config nela, para
# sempre, e o painel passa a ter mais achado falso do que verdadeiro.
#
# Aqui as regiões ligadas são declaradas, e a lista é a mesma que a SCP
# permite. Nada deixa de ser visto: não se pode ver o que não se pode criar.
resource "aws_securityhub_finding_aggregator" "este" {
  linking_mode      = "SPECIFIED_REGIONS"
  specified_regions = var.regioes_ligadas
}

resource "aws_securityhub_organization_configuration" "central" {
  auto_enable           = false
  auto_enable_standards = "NONE"
  organization_configuration {
    configuration_type = "CENTRAL" # policies de configuração distribuem o mesmo piso
  }

  depends_on = [aws_securityhub_finding_aggregator.este]
}

resource "aws_securityhub_configuration_policy" "piso" {
  name        = "piso-organizacional"
  description = "o mesmo piso de deteccao em todas as contas"

  configuration_policy {
    service_enabled       = true
    enabled_standard_arns = var.standards_arns

    # O bloco é opcional para o Terraform e obrigatório para a API quando o
    # serviço está ligado: sem ele o apply morre com "security_controls_
    # configuration must be defined when service_enabled is true", depois de o
    # delegated admin já ter sincronizado, que leva vinte e cinco minutos.
    #
    # Lista de desligados vazia é o piso: todo controle do standard ligado. É o
    # que "o mesmo piso de detecção em todas as contas" quer dizer, e desligar
    # controle passa a ser declaração visível no diff, não omissão.
    security_controls_configuration {
      disabled_control_identifiers = var.controles_desligados
    }
  }

  depends_on = [aws_securityhub_organization_configuration.central]
}

resource "aws_securityhub_configuration_policy_association" "raiz" {
  target_id = var.root_id
  policy_id = aws_securityhub_configuration_policy.piso.id
}

# ── GuardDuty: a camada de ameaça ────────────────────────────────────────────
#
# O Security Hub acima mede postura — "este balde devia estar assim". Não vê
# ameaça: credencial usada de onde nunca foi usada, instância conversando com
# destino conhecido de mineração. Quem vê é o GuardDuty, e sem ele o Security
# Hub agrega o vazio.
#
# O detector NÃO é criado aqui. Ao registrar a conta como administradora, o
# próprio GuardDuty já liga o serviço nela, naquela região. Declarar o recurso
# faria o apply morrer com "detector already exists" — e o dado que falta é o
# id, não a criação. Por isso data, e não resource.
data "aws_guardduty_detector" "primaria" {}

data "aws_guardduty_detector" "secundaria" {
  provider = aws.secundaria
}

# `ALL` alcança as contas que já existem, não só as próximas. `NEW` deixaria
# as quarenta e oito de hoje para trás e só valeria para a quadragésima nona.
resource "aws_guardduty_organization_configuration" "primaria" {
  detector_id                      = data.aws_guardduty_detector.primaria.id
  auto_enable_organization_members = "ALL"
}

resource "aws_guardduty_organization_configuration" "secundaria" {
  provider = aws.secundaria

  detector_id                      = data.aws_guardduty_detector.secundaria.id
  auto_enable_organization_members = "ALL"
}

resource "aws_guardduty_organization_configuration_feature" "primaria" {
  for_each = var.guardduty_recursos

  detector_id = data.aws_guardduty_detector.primaria.id
  name        = each.key
  auto_enable = each.value.auto_enable

  dynamic "additional_configuration" {
    for_each = each.value.adicionais
    content {
      name        = additional_configuration.value.name
      auto_enable = additional_configuration.value.auto_enable
    }
  }

  depends_on = [aws_guardduty_organization_configuration.primaria]
}

resource "aws_guardduty_organization_configuration_feature" "secundaria" {
  provider = aws.secundaria
  for_each = var.guardduty_recursos

  detector_id = data.aws_guardduty_detector.secundaria.id
  name        = each.key
  auto_enable = each.value.auto_enable

  dynamic "additional_configuration" {
    for_each = each.value.adicionais
    content {
      name        = additional_configuration.value.name
      auto_enable = additional_configuration.value.auto_enable
    }
  }

  depends_on = [aws_guardduty_organization_configuration.secundaria]
}

# ── Access Analyzer: a camada de acesso externo ──────────────────────────────
#
# `ORGANIZATION` é o que torna este analyzer utilizável: a zona de confiança
# passa a ser a organização inteira, e o compartilhamento entre contas-irmãs
# (chave usada de outra conta, balde de artefatos, papel assumido pela esteira,
# pool de CIDR por RAM) deixa de ser achado. Sobra o que de fato é de fora.
#
# Um analyzer de tipo ACCOUNT no lugar deste veria cada conta vizinha como
# estranha, e o ruído enterraria o achado verdadeiro no primeiro dia.
resource "aws_accessanalyzer_analyzer" "organizacao" {
  analyzer_name = "acesso-externo-organizacao"
  type          = "ORGANIZATION"
}

resource "aws_accessanalyzer_analyzer" "organizacao_secundaria" {
  provider = aws.secundaria

  analyzer_name = "acesso-externo-organizacao"
  type          = "ORGANIZATION"
}

# `auto_enable_organization_members = "ALL"` não alcança quem já está na
# organização: ele governa quem CHEGA. A documentação da AWS é explícita em
# mandar rodar CreateMembers com a credencial da conta delegada para as contas
# existentes, e sem isso o resultado é o pior tipo de sucesso — a configuração
# de organização aplica, as features aplicam, `describe-organization-configuration`
# devolve tudo verde, e `list-members` devolve zero. Nenhuma conta vigiada, e
# nenhum erro em lugar nenhum.
data "aws_organizations_organization" "esta" {}

locals {
  # Fora a própria conta delegada: ela não é membro de si mesma, e pedir isso
  # devolve erro que parece de permissão.
  contas_membro = {
    for c in data.aws_organizations_organization.esta.accounts :
    c.id => c.email if c.id != data.aws_caller_identity.esta.account_id && c.status == "ACTIVE"
  }
}

data "aws_caller_identity" "esta" {}

resource "aws_guardduty_member" "primaria" {
  for_each = local.contas_membro

  detector_id = data.aws_guardduty_detector.primaria.id
  account_id  = each.key
  email       = each.value

  # Convite é o caminho de fora da organização. Aqui a relação já existe pelo
  # Organizations, e convidar criaria uma segunda relação, pendente de aceite.
  invite = false

  # O e-mail serve à chamada que cria o membro e não volta na leitura: a API do
  # GuardDuty não o devolve, e o provider grava vazio no estado. Sem esta linha,
  # todo plano seguinte vê e-mail faltando, e e-mail força substituição — o que
  # significa DESTRUIR o membro, que é desligar o GuardDuty naquela conta, e
  # recriar. Noventa e oito vezes, a cada apply, para sempre.
  #
  # É o mesmo defeito de fundo das sub-configurações do agente logo acima:
  # atributo que a API aceita na escrita e não devolve na leitura vira diferença
  # eterna. A diferença é o preço — lá era ruído no plano, aqui é a organização
  # inteira piscando sem vigia.
  #
  # `invite` entra na lista pelo motivo oposto: a API DEVOLVE, e devolve `true`,
  # porque para ela associação por Organizations também é uma associação. O
  # provider lê `true`, compara com o `false` declarado, e traduz a diferença
  # em DisassociateMembers. A AWS recusa a chamada enquanto o auto-enable da
  # organização estiver em ALL, e foi essa recusa que impediu o estrago — mas
  # depender da recusa da AWS não é desenho, é sorte.
  #
  # O fundo disto é que este recurso só existe pelo ato: CreateMembers para as
  # contas que já estavam na organização quando o piso subiu. Passado o ato,
  # quem mantém a relação é o Organizations, e o Terraform não tem o que
  # reconciliar. As duas linhas abaixo dizem exatamente isso.
  lifecycle {
    ignore_changes = [email, invite]
  }

  depends_on = [aws_guardduty_organization_configuration.primaria]
}

resource "aws_guardduty_member" "secundaria" {
  provider = aws.secundaria
  for_each = local.contas_membro

  detector_id = data.aws_guardduty_detector.secundaria.id
  account_id  = each.key
  email       = each.value
  invite      = false

  # O e-mail serve à chamada que cria o membro e não volta na leitura: a API do
  # GuardDuty não o devolve, e o provider grava vazio no estado. Sem esta linha,
  # todo plano seguinte vê e-mail faltando, e e-mail força substituição — o que
  # significa DESTRUIR o membro, que é desligar o GuardDuty naquela conta, e
  # recriar. Noventa e oito vezes, a cada apply, para sempre.
  #
  # É o mesmo defeito de fundo das sub-configurações do agente logo acima:
  # atributo que a API aceita na escrita e não devolve na leitura vira diferença
  # eterna. A diferença é o preço — lá era ruído no plano, aqui é a organização
  # inteira piscando sem vigia.
  #
  # `invite` entra na lista pelo motivo oposto: a API DEVOLVE, e devolve `true`,
  # porque para ela associação por Organizations também é uma associação. O
  # provider lê `true`, compara com o `false` declarado, e traduz a diferença
  # em DisassociateMembers. A AWS recusa a chamada enquanto o auto-enable da
  # organização estiver em ALL, e foi essa recusa que impediu o estrago — mas
  # depender da recusa da AWS não é desenho, é sorte.
  #
  # O fundo disto é que este recurso só existe pelo ato: CreateMembers para as
  # contas que já estavam na organização quando o piso subiu. Passado o ato,
  # quem mantém a relação é o Organizations, e o Terraform não tem o que
  # reconciliar. As duas linhas abaixo dizem exatamente isso.
  lifecycle {
    ignore_changes = [email, invite]
  }

  depends_on = [aws_guardduty_organization_configuration.secundaria]
}

# ── Inspector: a varredura da carga ──────────────────────────────────────────
#
# O `enabler` liga o serviço na própria conta delegada e escolhe o que varre.
# A configuração de organização é o que alcança as contas-membro — e aqui vale
# a lição que o GuardDuty cobrou caro: `auto_enable` governa quem chega. Quem
# já está entra pelo `member_account_ids` do enabler, com a lista vinda do
# Organizations, do mesmo jeito que os membros do GuardDuty acima.
# Dois recursos, e não um, porque a API recusa a lista misturada: "account_ids
# can contain either the administrator account or one or more member accounts".
# A conta que administra liga o serviço para si por um caminho, e liga para as
# outras por outro.
resource "aws_inspector2_enabler" "primaria_administradora" {
  account_ids    = [data.aws_caller_identity.esta.account_id]
  resource_types = var.inspector_recursos

  depends_on = [aws_guardduty_organization_configuration.primaria]
}

# A quarta vez que a mesma armadilha aparece hoje, e a mais silenciosa de todas:
# delegar o Inspector não associa as contas da organização a ele. Sem associar,
# `list-members` devolve zero e o enabler morre dizendo que a conta "is not
# present in the organization" — mensagem que sugere problema no Organizations
# quando o que falta é uma chamada do próprio Inspector.
resource "aws_inspector2_member_association" "primaria" {
  for_each = local.contas_membro

  account_id = each.key

  depends_on = [aws_inspector2_enabler.primaria_administradora]
}

resource "aws_inspector2_member_association" "secundaria" {
  provider = aws.secundaria
  for_each = local.contas_membro

  account_id = each.key

  depends_on = [aws_inspector2_enabler.secundaria_administradora]
}

resource "aws_inspector2_enabler" "primaria" {
  account_ids    = keys(local.contas_membro)
  resource_types = var.inspector_recursos

  depends_on = [aws_inspector2_member_association.primaria]
}

# Dois recursos, e não um, porque a API recusa a lista misturada: "account_ids
# can contain either the administrator account or one or more member accounts".
# A conta que administra liga o serviço para si por um caminho, e liga para as
# outras por outro.
resource "aws_inspector2_enabler" "secundaria_administradora" {
  provider = aws.secundaria

  account_ids    = [data.aws_caller_identity.esta.account_id]
  resource_types = var.inspector_recursos_secundaria

  depends_on = [aws_guardduty_organization_configuration.secundaria]
}

resource "aws_inspector2_enabler" "secundaria" {
  provider = aws.secundaria

  account_ids    = keys(local.contas_membro)
  resource_types = var.inspector_recursos_secundaria

  depends_on = [aws_inspector2_member_association.secundaria]
}

resource "aws_inspector2_organization_configuration" "primaria" {
  auto_enable {
    ec2         = contains(var.inspector_recursos, "EC2")
    ecr         = contains(var.inspector_recursos, "ECR")
    lambda      = contains(var.inspector_recursos, "LAMBDA")
    lambda_code = contains(var.inspector_recursos, "LAMBDA_CODE")
  }

  depends_on = [aws_inspector2_enabler.primaria]
}

resource "aws_inspector2_organization_configuration" "secundaria" {
  provider = aws.secundaria

  auto_enable {
    ec2         = contains(var.inspector_recursos_secundaria, "EC2")
    ecr         = contains(var.inspector_recursos_secundaria, "ECR")
    lambda      = contains(var.inspector_recursos_secundaria, "LAMBDA")
    lambda_code = contains(var.inspector_recursos_secundaria, "LAMBDA_CODE")
  }

  depends_on = [aws_inspector2_enabler.secundaria]
}

# ── Macie: a varredura do dado ───────────────────────────────────────────────
#
# Como o detector do GuardDuty lá em cima, o Macie NÃO é habilitado aqui:
# registrar a conta como administradora já o liga nela, e declarar o recurso faz
# o apply morrer com "ConflictException: Macie has already been enabled". É a
# terceira vez que este mesmo padrão aparece hoje — delegar um serviço de
# detecção liga o serviço na conta delegada, de graça e sem avisar.
resource "aws_macie2_organization_configuration" "primaria" {
  auto_enable = true
}

resource "aws_macie2_organization_configuration" "secundaria" {
  provider = aws.secundaria

  auto_enable = true
}

# Mesma armadilha do GuardDuty, mesma cura: `auto_enable` acima vale para quem
# chega, e estes são os que já estavam.
resource "aws_macie2_member" "primaria" {
  for_each = local.contas_membro

  account_id                            = each.key
  email                                 = each.value
  invite                                = false
  invitation_disable_email_notification = true

  # Pelo mesmo motivo do membro do GuardDuty: a API aceita o e-mail na criação
  # e não o devolve na leitura, e o convite é a via de fora da organização.
  lifecycle {
    ignore_changes = [email, invite]
  }

  depends_on = [aws_macie2_organization_configuration.primaria]
}

resource "aws_macie2_member" "secundaria" {
  provider = aws.secundaria
  for_each = local.contas_membro

  account_id                            = each.key
  email                                 = each.value
  invite                                = false
  invitation_disable_email_notification = true

  lifecycle {
    ignore_changes = [email, invite]
  }

  depends_on = [aws_macie2_organization_configuration.secundaria]
}
