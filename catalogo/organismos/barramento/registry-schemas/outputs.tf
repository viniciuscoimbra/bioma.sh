output "registry_arn" { value = aws_glue_registry.este.arn }

# O papel que um leitor de outra conta assume para ler este registry; vazio
# quando não há leitor de fora (contas_leitoras vazia).
output "papel_leitor_arn" { value = length(aws_iam_role.leitor) > 0 ? aws_iam_role.leitor[0].arn : "" }
