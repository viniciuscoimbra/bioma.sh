output "politica_arn" { value = aws_iam_policy.acesso.arn }
output "balde_gravacao" { value = aws_s3_bucket.gravacao.id }
output "documento_sessao" { value = aws_ssm_document.sessao.name }
output "grupo_de_log" { value = aws_cloudwatch_log_group.sessao.name }

# Quem grava é a máquina, e ela mora noutra célula: sem publicar isto, a
# permissão do destino teria de ser escrita à mão em cada organismo que
# hospeda instância.
output "politica_gravacao_arn" { value = aws_iam_policy.gravacao.arn }
