# O que esta célula publica para as vizinhas. É daqui que sai o valor
# que a dependência delas consome; endereço que cruza dono vira
# hormônio (aws_ssm_parameter), e não output.
output "id" { value = aws_lambda_function.lambda_function.id }
output "arn" { value = aws_lambda_function.lambda_function.arn }
output "iam_role_id" { value = aws_iam_role.lambda_function.id }
output "iam_role_arn" { value = aws_iam_role.lambda_function.arn }
output "cloudwatch_log_group_id" { value = aws_cloudwatch_log_group.lambda_function.id }
output "cloudwatch_log_group_arn" { value = aws_cloudwatch_log_group.lambda_function.arn }
