output "bucket_arn" { value = aws_s3_bucket.artefatos.arn }
output "bucket_nome" { value = aws_s3_bucket.artefatos.id }

# Quem lê o artefato precisa decifrar com esta chave. Publicar o ARN aqui evita
# que a célula do leitor escolha uma chave por conta própria e descubra o
# desencontro só quando o objeto chegar cifrado com outra.
output "kms_key_arn" { value = var.kms_key_arn }
