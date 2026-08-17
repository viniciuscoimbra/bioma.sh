# Estes ARNs são o valor que entra em ROLE_ESTEIRA_REGISTRO, ROLE_ESTEIRA_DEV,
# ROLE_ESTEIRA_HML e ROLE_ESTEIRA_PRD no PREENCHER.md do repositório do
# serviço. Sem eles publicados, quem preenche a ficha não tem o que colar.
output "role_arns" {
  value = { for chave, role in aws_iam_role.esta : chave => role.arn }
}
