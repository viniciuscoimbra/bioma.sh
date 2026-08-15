# Organismo bucket-artefatos (15): onde a esteira guarda o que ela produz e
# outras contas consomem. Hoje o único consumidor é o plugin do conector do MSK
# Connect, que era um ARN escrito à mão apontando para um balde que não nascia
# em lugar nenhum.
#
# Ele mora na conta de devsecops e é lido de fora por política de balde, role a
# role. Balde de artefato aberto para a Organization inteira, ou para o `root`
# de uma conta, é caminho de entrada de código que ninguém revisou.

resource "aws_s3_bucket" "artefatos" {
  bucket = "${var.prefixo}-artefatos-esteira-${var.conta}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "artefatos" {
  bucket                  = aws_s3_bucket.artefatos.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# A conta leitora sai do ARN da role, e não de uma segunda variável: duas
# listas que precisam concordar acabam discordando na primeira conta nova.
locals {
  contas_leitoras = distinct([for arn in var.roles_leitoras : split(":", arn)[4]])
}

# O principal continua sendo o `root` da conta leitora porque `Principal` de
# política de balde exige um ARN que já exista, e a role do conector nasce
# depois deste balde (ela recebe o ARN dele como entrada). Nomear a role no
# `Principal` fecharia o ciclo entre as duas receitas.
#
# Quem fecha o escopo é a condição: `aws:PrincipalArn` compara a identidade que
# chega, uma a uma. Com ela, delegar à conta deixa de significar "qualquer
# principal daquela conta com IAM local compatível" e passa a significar
# exatamente as roles listadas. O nome da role é determinístico na receita que
# a cria, então a lista é escrita sem depender do estado dela.
resource "aws_s3_bucket_policy" "quem_le" {
  count = length(var.roles_leitoras) == 0 ? 0 : 1

  bucket = aws_s3_bucket.artefatos.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "SoAsRolesNomeadasLeem"
      Effect    = "Allow"
      Principal = { AWS = [for c in local.contas_leitoras : "arn:aws:iam::${c}:root"] }
      Action    = ["s3:GetObject", "s3:ListBucket"]
      # O prefixo entra na conta: restringir só o principal deixava quem lê o
      # plugin ler o balde inteiro, e a esteira guarda aqui mais do que plugin.
      # Listar continua valendo no balde, porque `ListBucket` não aceita chave.
      Resource = concat(
        [aws_s3_bucket.artefatos.arn],
        [for p in var.prefixos_leitura : "${aws_s3_bucket.artefatos.arn}/${p}"],
      )
      Condition = {
        ArnEquals = { "aws:PrincipalArn" = var.roles_leitoras }
      }
    }]
  })
}
