# Organismo consumo/athena-consumidor (04): workgroup do consumidor com bucket
# de resultados próprio. O acesso ao produto chega por acesso-lake, concedido
# pelo dono; aqui só a infra de consulta.

resource "aws_s3_bucket" "resultados" {
  bucket        = "${var.prefixo}-athena-${var.consumidor}-${var.plano}"
  force_destroy = true # resultado de consulta é descartável
}

# O Lake Formation filtra o que a consulta lê; o resultado dela pousa neste
# balde já filtrado, mas em claro para quem alcança o balde. Cifra com a chave
# do plano (04.1: "workgroup e bucket de resultados por ambiente e audiência,
# cifrados"), e não com a chave do S3, para o acesso ao resultado passar pela
# mesma chave que o dado.
resource "aws_s3_bucket_server_side_encryption_configuration" "resultados" {
  bucket = aws_s3_bucket.resultados.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
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
        encryption_option = "SSE_KMS"
        kms_key_arn       = var.kms_key_arn
      }
    }
  }
}

# O balde aceita HTTP por padrão, e HTTP num balde de resultado de consulta é o mesmo dado
# viajando em claro. A política recusa antes: quem chegar sem TLS leva negação,
# e não uma resposta.
resource "aws_s3_bucket_policy" "resultados_so_com_tls" {
  bucket = aws_s3_bucket.resultados.id
  policy = data.aws_iam_policy_document.resultados_so_com_tls.json
}

data "aws_iam_policy_document" "resultados_so_com_tls" {
  statement {
    sid       = "NegaTransporteInseguro"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.resultados.arn, "${aws_s3_bucket.resultados.arn}/*"]

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
resource "aws_s3_bucket_logging" "resultados" {
  bucket        = aws_s3_bucket.resultados.id
  target_bucket = "gf-acesso-${data.aws_caller_identity.registro.account_id}-${data.aws_region.registro.region}"
  target_prefix = "${aws_s3_bucket.resultados.id}/"
}

data "aws_caller_identity" "registro" {}

data "aws_region" "registro" {}
