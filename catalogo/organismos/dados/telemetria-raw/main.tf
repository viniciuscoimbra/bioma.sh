# Organismo telemetria-raw (14): a camada fria da telemetria. Firehose recebe
# (do destination de logs e do ADOT) e grava no S3 particionado; retenção longa
# barata, consulta por Athena quando precisar.

resource "aws_s3_bucket" "raw" {
  bucket = "${var.prefixo}-telemetria-raw-${var.plano}"

  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "raw" {
  bucket = aws_s3_bucket.raw.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "raw" {
  bucket                  = aws_s3_bucket.raw.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "raw" {
  bucket = aws_s3_bucket.raw.id
  rule {
    id     = "frio"
    status = "Enabled"
    filter {}
    transition {
      days          = 30
      storage_class = "GLACIER_IR"
    }
    expiration {
      days = var.retencao_dias
    }
  }
}

resource "aws_iam_role" "firehose" {
  name = "telemetria-firehose-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "firehose.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "grava" {
  name = "grava-raw"
  role = aws_iam_role.firehose.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetBucketLocation", "s3:ListBucket", "s3:AbortMultipartUpload"]
        Resource = [aws_s3_bucket.raw.arn, "${aws_s3_bucket.raw.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:GenerateDataKey", "kms:Decrypt"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_kinesis_firehose_delivery_stream" "entrega" {
  name        = "telemetria-raw-${var.plano}"
  destination = "extended_s3"

  extended_s3_configuration {
    role_arn            = aws_iam_role.firehose.arn
    bucket_arn          = aws_s3_bucket.raw.arn
    prefix              = "ano=!{timestamp:yyyy}/mes=!{timestamp:MM}/dia=!{timestamp:dd}/"
    error_output_prefix = "erros/!{firehose:error-output-type}/"
    buffering_interval  = 300
    compression_format  = "GZIP"
    kms_key_arn         = var.kms_key_arn
  }
}

# O balde aceita HTTP por padrão, e HTTP num balde de telemetria bruta é o mesmo dado
# viajando em claro. A política recusa antes: quem chegar sem TLS leva negação,
# e não uma resposta.
resource "aws_s3_bucket_policy" "raw_so_com_tls" {
  bucket = aws_s3_bucket.raw.id
  policy = data.aws_iam_policy_document.raw_so_com_tls.json
}

data "aws_iam_policy_document" "raw_so_com_tls" {
  statement {
    sid       = "NegaTransporteInseguro"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.raw.arn, "${aws_s3_bucket.raw.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

# O destino do registro de acesso é o balde que o piso da conta cria, e o nome
# dele é determinístico de propósito: assim esta receita não precisa depender do
# estado de outra célula para saber para onde apontar.
resource "aws_s3_bucket_logging" "raw" {
  bucket        = aws_s3_bucket.raw.id
  target_bucket = "gf-acesso-${data.aws_caller_identity.registro.account_id}-${data.aws_region.registro.region}"
  target_prefix = "${aws_s3_bucket.raw.id}/"
}

data "aws_caller_identity" "registro" {}

data "aws_region" "registro" {}
