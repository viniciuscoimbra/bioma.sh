output "documento" { value = aws_ssm_document.tunel.name }
output "politica_arn" { value = aws_iam_policy.uso.arn }

# Entra no permission set por nome, e por isso o nome é derivado.
output "politica_nome" { value = aws_iam_policy.uso.name }
