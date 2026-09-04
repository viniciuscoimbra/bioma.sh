# Organismo bucket-artefatos (15): onde a esteira guarda o que ela produz e
# outras contas consomem. Hoje o único consumidor é o plugin do conector do MSK
# Connect, que era um ARN escrito à mão apontando para um balde que não nascia
# em lugar nenhum.
#
# Ele mora na conta de devsecops e é lido de fora por política de balde, role a
# role. Balde de artefato aberto para a Organization inteira, ou para o `root`
# de uma conta, é caminho de entrada de código que ninguém revisou.

# O SUFIXO EXISTE PORQUE O BALDE É REGIONAL E O NOME É GLOBAL. Um gateway
# endpoint de S3 só alcança o S3 da PRÓPRIA região, e a VPC do executor não tem
# saída para internet: o executor de Virgínia não lê um balde de São Paulo, e o
# download morre em `exit status 1` na fase de PRE_BUILD, sem dizer que é rede.
# Quem opera em outra região precisa de um balde lá, e nome de balde é único no
# mundo, então o segundo não pode se chamar igual ao primeiro.
#
# O default vazio mantém o balde que já existe com o nome que já tem. Quem
# precisa do segundo diz qual é o sufixo, e a região é a resposta óbvia.
resource "aws_s3_bucket" "artefatos" {
  bucket = "${var.prefixo}-artefatos-esteira-${var.conta}${var.sufixo != "" ? "-${var.sufixo}" : ""}"

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
# A recusa de transporte inseguro NÃO é condicional, e por isso a política
# deixou de ter `count`. Antes ela só existia quando havia role leitora
# declarada, e o balde sem leitor nomeado ficava aceitando HTTP — o caso menos
# vigiado era o mais aberto.
resource "aws_s3_bucket_policy" "quem_le" {
  bucket = aws_s3_bucket.artefatos.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat([{
      Sid       = "NegaTransporteInseguro"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource  = [aws_s3_bucket.artefatos.arn, "${aws_s3_bucket.artefatos.arn}/*"]
      Condition = { Bool = { "aws:SecureTransport" = "false" } }
      }], length(var.roles_leitoras) == 0 ? [] : [{
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
    }])
  })
}

# Versão antiga que ninguém lê continua sendo dado guardado e cobrado. O ciclo
# de vida não apaga o artefato corrente: recolhe as versões anteriores e as
# partes de envio que ficaram pelo caminho — e num balde de artefato, envio
# interrompido é o resíduo mais comum.
resource "aws_s3_bucket_lifecycle_configuration" "artefatos" {
  bucket = aws_s3_bucket.artefatos.id

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
resource "aws_s3_bucket_logging" "artefatos" {
  bucket        = aws_s3_bucket.artefatos.id
  target_bucket = "gf-acesso-${data.aws_caller_identity.registro.account_id}-${data.aws_region.registro.region}"
  target_prefix = "${aws_s3_bucket.artefatos.id}/"
}

data "aws_caller_identity" "registro" {}

data "aws_region" "registro" {}
