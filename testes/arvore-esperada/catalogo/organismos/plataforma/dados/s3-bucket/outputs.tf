# O que esta célula publica para as vizinhas. É daqui que sai o valor
# que a dependência delas consome; endereço que cruza dono vira
# hormônio (aws_ssm_parameter), e não output.
output "id" { value = aws_s3_bucket.s3_bucket.id }
output "arn" { value = aws_s3_bucket.s3_bucket.arn }
