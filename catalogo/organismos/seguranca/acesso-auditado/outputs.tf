output "politica_arn" { value = aws_iam_policy.acesso.arn }
output "balde_gravacao" { value = aws_s3_bucket.gravacao.id }
output "documento_sessao" { value = aws_ssm_document.sessao.name }
output "grupo_de_log" { value = aws_cloudwatch_log_group.sessao.name }
