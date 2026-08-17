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

# A política de bucket com os dois denies que a referência exige (04 · Decisões
# 2 e 6; cenário K8 da validação): transporte inseguro negado a todos, e leitura
# ou escrita direta negada a quem não é role de escrita do trilho. Quem consome
# entra pelo Lake Formation, que vende credencial da role de registro; por isso
# a role de registro está na lista, e o consumidor não.
#
# `aws:PrincipalArn` casa o ARN da role, e não o da sessão: uma role assumida
# por qualquer sessão continua sendo a mesma role para esta condição. A lista
# chega por input porque a célula sabe quem escreve, e a receita não.
#
# Deny explícito vence Allow de IAM: um administrador da conta que tente ler o
# lake direto é recusado como qualquer outro. É o efeito desenhado, e a saída
# de emergência é `excecoes_arns`, declarada e revisada no diff.
data "aws_iam_policy_document" "camada" {
  for_each = local.camadas

  statement {
    sid     = "NegaTransporteInseguro"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.camada[each.key].arn,
      "${aws_s3_bucket.camada[each.key].arn}/*",
    ]
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

  statement {
    sid    = "NegaAcessoDiretoForaDoTrilho"
    effect = "Deny"
    actions = [
      "s3:GetObject", "s3:GetObjectVersion",
      "s3:PutObject", "s3:DeleteObject", "s3:DeleteObjectVersion",
    ]
    resources = ["${aws_s3_bucket.camada[each.key].arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "ArnNotLike"
      variable = "aws:PrincipalArn"
      values   = concat(var.principais_de_escrita, var.excecoes_arns)
    }
  }
}

resource "aws_s3_bucket_policy" "camada" {
  for_each = local.camadas

  bucket = aws_s3_bucket.camada[each.key].id
  policy = data.aws_iam_policy_document.camada[each.key].json

  # a política entra depois do bloqueio público: sem isso o PutBucketPolicy
  # pode correr antes do PAB e a AWS recusa política que ela ainda julga pública
  depends_on = [aws_s3_bucket_public_access_block.camada]
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
