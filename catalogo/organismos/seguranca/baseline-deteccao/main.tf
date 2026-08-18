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
