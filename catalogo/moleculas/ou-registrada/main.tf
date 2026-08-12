# Molécula ou-registrada: OU criada não é OU governada. O registro é a ativação
# do AWSControlTowerBaseline 5.0 (guia da fundação §3 camada 3): pai antes das
# filhas, parallelism 1, e a Security OU nunca recebe o baseline geral.

resource "aws_organizations_organizational_unit" "esta" {
  name      = var.nome
  parent_id = var.parent_id

  lifecycle { prevent_destroy = true }
}

# O baseline só existe depois da landing zone: ele é dela, e o identificador
# aparece quando ela termina. Registrar antes é impossível, e tentar quebrava o
# plano inteiro de `02-ous` numa mensagem do provider que não diz isso.
#
# O identificador chega por variável de instância, e não por SSM como este
# comentário dizia antes: não há data source do provider que liste baseline, e
# o parâmetro de SSM teria de ser escrito por alguém a partir da mesma consulta
# que o guia já faz. Quem lê a AWS e anota `TG_BASELINE_ARN` e
# `TG_IDENTITY_CENTER_BASELINE_ARN` é a fase das OUs no `--guia`.
#
# Sem o identificador, a OU nasce criada e não registrada, e a saída
# `registrada` abaixo diz isso em voz alta: OU criada não é OU governada, e
# descobrir isso na auditoria é tarde.
resource "aws_controltower_baseline" "registro" {
  count = var.registrar && var.baseline_identifier != null ? 1 : 0

  baseline_identifier = var.baseline_identifier # lido uma vez, vem por SSM (guia §3 camada 0)
  baseline_version    = "5.0"                   # a versão aplicável à LZ 4.0
  target_identifier   = aws_organizations_organizational_unit.esta.arn

  # O valor vai cru. Com `jsonencode`, o ARN chega à API entre aspas e ela
  # recusa com "must be the EnabledBaseline ARN of the baseline
  # 'IdentityCenterBaseline'", que aponta para o ARN e não para as aspas. O
  # exemplo da AWS em baseline-api-examples e o do provider passam a string
  # direta.
  dynamic "parameters" {
    for_each = var.identity_center_baseline_arn == null ? [] : [1]
    content {
      key   = "IdentityCenterEnabledBaselineArn"
      value = var.identity_center_baseline_arn
    }
  }
}
