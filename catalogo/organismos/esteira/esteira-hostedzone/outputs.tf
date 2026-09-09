# O ARN é previsível (arn:aws:iam::<conta_network>:role/esteira-hostedzone,
# composto nas células `oidc-servico` dos domínios sem consumir
# este output) — mas publicado aqui também, para quem compuser por
# `dependency` em vez de montar o ARN à mão.
output "role_arn" {
  value = aws_iam_role.esta.arn
}
