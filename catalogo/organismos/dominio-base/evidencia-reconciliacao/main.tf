# Organismo evidencia-reconciliacao (05): onde o resultado da reconciliação
# vira evidência imutável (object lock COMPLIANCE, retenção pela régua
# regulatória). O gate da migração lê daqui. Durabilidade permanente.

data "aws_region" "esta" {}

resource "aws_s3_bucket" "evidencia" {
  # A REGIÃO NO NOME, quarta peça hoje pela mesma razão: nome de balde é global E
  # amarrado a uma região, e o recém-apagado continua roteando para a antiga por
  # mais de uma hora. Com a região no nome, o novo nasce ao lado do velho.
  bucket              = "${var.prefixo}-${var.dominio}-evidencia-${var.ambiente}-${data.aws_region.esta.region}"
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

# O balde aceita HTTP por padrão, e HTTP num balde de evidência de reconciliação é o mesmo dado
# viajando em claro. A política recusa antes: quem chegar sem TLS leva negação,
# e não uma resposta.
resource "aws_s3_bucket_policy" "evidencia_so_com_tls" {
  bucket = aws_s3_bucket.evidencia.id
  policy = data.aws_iam_policy_document.evidencia_so_com_tls.json
}

data "aws_iam_policy_document" "evidencia_so_com_tls" {
  statement {
    sid       = "NegaSemTLS"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.evidencia.arn, "${aws_s3_bucket.evidencia.arn}/*"]

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

# Versão antiga que ninguém lê continua sendo dado guardado e cobrado. O ciclo
# de vida não apaga o objeto corrente: ele recolhe as versões anteriores e as
# partes de envio que ficaram pelo caminho.
resource "aws_s3_bucket_lifecycle_configuration" "evidencia" {
  bucket = aws_s3_bucket.evidencia.id

  rule {
    id     = "recolhe-versao-antiga-e-envio-incompleto"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.dias_versao_antiga
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# O destino do registro de acesso é o balde que o piso da conta cria, e o nome
# dele é determinístico de propósito: assim esta receita não precisa depender do
# estado de outra célula para saber para onde apontar.
resource "aws_s3_bucket_logging" "evidencia" {
  bucket        = aws_s3_bucket.evidencia.id
  target_bucket = "gf-acesso-${data.aws_caller_identity.registro.account_id}-${data.aws_region.registro.region}"
  target_prefix = "${aws_s3_bucket.evidencia.id}/"
}

data "aws_caller_identity" "registro" {}

data "aws_region" "registro" {}
