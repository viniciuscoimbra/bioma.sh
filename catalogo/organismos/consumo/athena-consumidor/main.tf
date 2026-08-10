# Organismo consumo/athena-consumidor (04): workgroup do consumidor com bucket
# de resultados próprio. O acesso ao produto chega por acesso-lake, concedido
# pelo dono; aqui só a infra de consulta.

resource "aws_s3_bucket" "resultados" {
  bucket        = "${var.prefixo}-athena-${var.consumidor}-${var.plano}"
  force_destroy = true # resultado de consulta é descartável
}

resource "aws_s3_bucket_public_access_block" "resultados" {
  bucket                  = aws_s3_bucket.resultados.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "resultados" {
  bucket = aws_s3_bucket.resultados.id
  rule {
    id     = "limpa"
    status = "Enabled"
    filter {}
    expiration {
      days = 30
    }
  }
}

resource "aws_athena_workgroup" "este" {
  name = "${var.consumidor}-${var.plano}"

  configuration {
    enforce_workgroup_configuration = true
    bytes_scanned_cutoff_per_query  = var.teto_bytes_por_consulta

    result_configuration {
      output_location = "s3://${aws_s3_bucket.resultados.bucket}/"
      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }
  }
}
