# Organismo evidencia-reconciliacao (05): onde o resultado da reconciliação
# vira evidência imutável (object lock COMPLIANCE, retenção pela régua
# regulatória). O gate da migração lê daqui. Durabilidade permanente.

resource "aws_s3_bucket" "evidencia" {
  bucket              = "${var.prefixo}-${var.dominio}-evidencia-${var.ambiente}"
  object_lock_enabled = true

  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "evidencia" {
  bucket = aws_s3_bucket.evidencia.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_object_lock_configuration" "evidencia" {
  bucket = aws_s3_bucket.evidencia.id
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = var.retencao_dias
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "evidencia" {
  bucket = aws_s3_bucket.evidencia.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "evidencia" {
  bucket                  = aws_s3_bucket.evidencia.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
