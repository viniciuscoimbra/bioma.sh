# Organismo s3-bucket: trilha de auditoria
# Zona declarada no bloco: Gama > Delta · uma por plano (nao-prod, prod)
# Tecido: permanente (guarda evidência do passado. Refazer do zero traz outro conteúdo, porque a origem mudou desde então)
resource "aws_s3_bucket" "s3_bucket" {


  # tecido permanente: não cai por destroy
  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "s3_bucket" {
  bucket                       = aws_s3_bucket.s3_bucket.id # ligado pelo bioma: mesma receita
  versioning_configuration {
    status                     = "Enabled" # derivado pelo bioma
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_bucket" {
  bucket                       = aws_s3_bucket.s3_bucket.id # ligado pelo bioma: mesma receita
  rule {
    # sem argumento obrigatório
  }
}

resource "aws_s3_bucket_public_access_block" "s3_bucket" {
  bucket                       = aws_s3_bucket.s3_bucket.id # ligado pelo bioma: mesma receita
}

resource "aws_s3_bucket_lifecycle_configuration" "s3_bucket" {
  bucket                       = aws_s3_bucket.s3_bucket.id # ligado pelo bioma: mesma receita
}
