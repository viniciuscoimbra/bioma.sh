output "bronze_arn" { value = aws_s3_bucket.camada["bronze"].arn }
output "silver_arn" { value = aws_s3_bucket.camada["silver"].arn }
