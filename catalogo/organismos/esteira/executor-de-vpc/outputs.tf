output "projeto_nome" { value = aws_codebuild_project.este.name }
output "role_arn" { value = aws_iam_role.este.arn }
output "security_group_id" { value = aws_security_group.este.id }
output "grupo_de_log" { value = aws_cloudwatch_log_group.este.name }
