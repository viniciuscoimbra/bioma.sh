# Organismo produto-gold (04.1): o balde e o catálogo do produto de dado do
# domínio. Separado dos jobs porque não nascem nem morrem juntos: o job se
# refaz a cada release, o produto guarda o que a malha consome. Reconstruir a
# partir do silver não devolve o que a origem mudou no caminho, então o tecido
# é permanente. As tabelas dentro do catálogo são da esteira de dados.

resource "aws_s3_bucket" "gold" {
  bucket = "${var.prefixo}-${var.dominio}-gold-${var.ambiente}"

  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "gold" {
  bucket = aws_s3_bucket.gold.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "gold" {
  bucket = aws_s3_bucket.gold.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "gold" {
  bucket                  = aws_s3_bucket.gold.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_glue_catalog_database" "gold" {
  name = "${var.dominio}_gold_${var.ambiente}"

  # guarda a definição das tabelas que a esteira cria
  lifecycle { prevent_destroy = true }
}
