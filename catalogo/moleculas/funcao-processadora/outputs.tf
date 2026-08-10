output "nome_da_funcao" { value = aws_lambda_function.funcao.function_name }
output "funcao_arn" { value = aws_lambda_function.funcao.arn }
output "permissao_arn" { value = aws_iam_role.permissao.arn }
output "permissao_nome" { value = aws_iam_role.permissao.name }
