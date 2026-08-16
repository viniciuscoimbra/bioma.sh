output "endpoint" { value = aws_db_instance.este.address }
output "porta" { value = aws_db_instance.este.port }
output "arn" { value = aws_db_instance.este.arn }

# O segredo do usuário mestre é gerado pelo RDS. Quem for administrar o banco
# precisa de `secretsmanager:GetSecretValue` sobre este ARN, e sem publicá-lo
# a permissão teria de ser escrita por adivinhação.
output "segredo_mestre_arn" {
  value = one(aws_db_instance.este.master_user_secret[*].secret_arn)
}

# Ela entra no permission set de quem administra, por nome, e é por isso que o
# nome é derivado e não livre.
output "politica_administracao_arn" { value = aws_iam_policy.administracao.arn }
output "politica_administracao_nome" { value = aws_iam_policy.administracao.name }
