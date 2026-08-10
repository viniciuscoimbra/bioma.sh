# Organismo porta-dados (04.1): registra o gold no Lake Formation com role
# própria. É o pré-requisito dos grants (acesso-lake): sem registro, não há
# permissão fina por tabela.

resource "aws_iam_role" "registro" {
  name = "lf-registro-${var.dominio}-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lakeformation.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "acessa_gold" {
  name = "acessa-gold"
  role = aws_iam_role.registro.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [var.bucket_gold_arn, "${var.bucket_gold_arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_lakeformation_resource" "gold" {
  arn      = var.bucket_gold_arn
  role_arn = aws_iam_role.registro.arn
}
