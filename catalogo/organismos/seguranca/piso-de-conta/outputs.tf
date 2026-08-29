output "balde_de_registro" {
  value       = aws_s3_bucket.acesso.arn
  description = "onde o registro de acesso e o de fluxo desta conta caem"
}
