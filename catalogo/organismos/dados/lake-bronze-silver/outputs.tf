output "bronze_arn" { value = aws_s3_bucket.camada["bronze"].arn }
output "silver_arn" { value = aws_s3_bucket.camada["silver"].arn }

# O nome entra em URI de warehouse (`s3://<nome>/`), e a URI não se monta a
# partir do ARN sem cortar string: quem precisa do nome recebe o nome.
output "bronze_nome" { value = aws_s3_bucket.camada["bronze"].bucket }
output "silver_nome" { value = aws_s3_bucket.camada["silver"].bucket }
