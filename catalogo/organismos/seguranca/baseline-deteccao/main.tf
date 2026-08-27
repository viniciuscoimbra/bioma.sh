# Organismo baseline-deteccao (00·D5, 03·D6): roda NA CONTA DELEGADA de
# segurança, depois do registro em delegated-admins. Não recria recorder,
# aggregator nem trail do Control Tower (guia §3 camada 2): consome-os. O que
# o CT não possui entra aqui: Security Hub em configuração central e o
# agregador de findings.

resource "aws_securityhub_finding_aggregator" "este" {
  linking_mode = "ALL_REGIONS"
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
  auto_enable = each.value

  depends_on = [aws_guardduty_organization_configuration.primaria]
}

resource "aws_guardduty_organization_configuration_feature" "secundaria" {
  provider = aws.secundaria
  for_each = var.guardduty_recursos

  detector_id = data.aws_guardduty_detector.secundaria.id
  name        = each.key
  auto_enable = each.value

  depends_on = [aws_guardduty_organization_configuration.secundaria]
}

# ── Access Analyzer: a camada de acesso externo ──────────────────────────────
#
# `ORGANIZATION` é o que torna este analyzer utilizável: a zona de confiança
# passa a ser a organização inteira, e o compartilhamento entre contas-irmãs
# (a chave do registry, o balde de artefatos, os papéis OIDC da esteira, o
# pool do IPAM por RAM) deixa de ser achado. Sobra o que de fato é de fora.
#
# Um analyzer de tipo ACCOUNT no lugar deste veria quarenta e oito vizinhas
# como estranhas, e o ruído enterraria o achado verdadeiro no primeiro dia.
resource "aws_accessanalyzer_analyzer" "organizacao" {
  analyzer_name = "acesso-externo-organizacao"
  type          = "ORGANIZATION"
}

resource "aws_accessanalyzer_analyzer" "organizacao_secundaria" {
  provider = aws.secundaria

  analyzer_name = "acesso-externo-organizacao"
  type          = "ORGANIZATION"
}
