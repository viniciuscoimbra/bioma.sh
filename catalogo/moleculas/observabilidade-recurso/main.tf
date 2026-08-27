# Molécula observabilidade-recurso (14): o padrão de alarme embutível. As
# receitas passam os alarmes delas; o central consome, nunca é dono do recurso.

resource "aws_cloudwatch_metric_alarm" "alarme" {
  for_each = var.alarmes

  alarm_name          = "${var.nome_recurso}-${each.key}"
  namespace           = each.value.namespace
  metric_name         = each.value.metrica
  statistic           = each.value.estatistica
  comparison_operator = each.value.operador
  threshold           = each.value.limiar
  evaluation_periods  = each.value.avaliacoes
  period              = each.value.periodo_s
  dimensions          = each.value.dimensoes
  treat_missing_data  = each.value.dado_ausente
  alarm_actions       = var.alarm_actions
}
