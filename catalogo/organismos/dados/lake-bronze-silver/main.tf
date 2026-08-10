# Organismo lake-bronze-silver (04): bronze e silver da plataforma. Gold NÃO
# nasce aqui: produto de dado é do domínio (04.1, posse do Data Mesh). Object
# lock no bronze quando a régua regulatória exigir (imutabilidade de evidência).

locals {
  camadas = toset(["bronze", "silver"])
}

resource "aws_s3_bucket" "camada" {
  for_each = local.camadas

  bucket              = "${var.prefixo}-${each.key}-${var.plano}"
  object_lock_enabled = each.key == "bronze" && var.object_lock_bronze

  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "camada" {
  for_each = local.camadas

  bucket = aws_s3_bucket.camada[each.key].id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "camada" {
  for_each = local.camadas

  bucket = aws_s3_bucket.camada[each.key].id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "camada" {
  for_each = local.camadas

  bucket                  = aws_s3_bucket.camada[each.key].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_object_lock_configuration" "bronze" {
  count = var.object_lock_bronze ? 1 : 0

  bucket = aws_s3_bucket.camada["bronze"].id
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = var.retencao_lock_dias
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "camada" {
  for_each = local.camadas

  bucket = aws_s3_bucket.camada[each.key].id
  rule {
    id     = "frio"
    status = "Enabled"
    filter {}
    transition {
      days          = var.dias_para_frio
      storage_class = "INTELLIGENT_TIERING"
    }
  }
}
