output "bucket_arn" { value = aws_s3_bucket.gold.arn }
output "bucket_nome" { value = aws_s3_bucket.gold.bucket }
output "database_gold" { value = aws_glue_catalog_database.gold.name }
