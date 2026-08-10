# Ligação subscricao-logs (14): subscription filter por log group na conta
# fonte, apontando o destination central. Destination entre contas dispensa
# role na fonte (a access policy do destination autoriza).

resource "aws_cloudwatch_log_subscription_filter" "esta" {
  for_each = var.log_groups

  name            = "para-central"
  log_group_name  = each.value
  filter_pattern  = var.filtro
  destination_arn = var.destination_arn
}
