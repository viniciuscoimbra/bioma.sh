# Molécula ou-registrada: OU criada não é OU governada. O registro é a ativação
# do AWSControlTowerBaseline 5.0 (guia da fundação §3 camada 3): pai antes das
# filhas, parallelism 1, e a Security OU nunca recebe o baseline geral.

resource "aws_organizations_organizational_unit" "esta" {
  name      = var.nome
  parent_id = var.parent_id

  lifecycle { prevent_destroy = true }
}

resource "aws_controltower_baseline" "registro" {
  count = var.registrar ? 1 : 0

  baseline_identifier = var.baseline_identifier # lido uma vez, vem por SSM (guia §3 camada 0)
  baseline_version    = "5.0"                   # a versão aplicável à LZ 4.0
  target_identifier   = aws_organizations_organizational_unit.esta.arn

  dynamic "parameters" {
    for_each = var.identity_center_baseline_arn == null ? [] : [1]
    content {
      key   = "IdentityCenterEnabledBaselineArn"
      value = jsonencode(var.identity_center_baseline_arn)
    }
  }
}
