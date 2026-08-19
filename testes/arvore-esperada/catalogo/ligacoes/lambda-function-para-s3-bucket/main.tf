# Ligação lambda-function-para-s3-bucket: trilha
# Por que é ligação: origem e destino em trilhos diferentes (gama e gama/delta): donos distintos pedem permissão dos dois lados
# Canal declarado no bloco: direto
#
# Ligação tem permissão dos DOIS lados e state próprio. Ela mora no live de
# quem tem a permissão de criar, que aqui é o trilho gama/delta.

# O lado de quem consome: um papel com a permissão declarada.
resource "aws_iam_role" "consumidor" {
  name               = "lambda-function-para-s3-bucket-consumidor"
  assume_role_policy = data.aws_iam_policy_document.confia.json
}

data "aws_iam_policy_document" "confia" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "AWS"
      identifiers = [var.conta_consumidora]
    }
  }
}

data "aws_iam_policy_document" "pode" {
  statement {
    actions   = var.acoes
    resources = [var.recurso_destino_arn]
  }
}

resource "aws_iam_role_policy" "consumidor" {
  role   = aws_iam_role.consumidor.id
  policy = data.aws_iam_policy_document.pode.json
}

# O lado de quem guarda o recurso: a política que autoriza o papel acima.
data "aws_iam_policy_document" "autoriza" {
  statement {
    actions   = var.acoes
    resources = [var.recurso_destino_arn]
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.consumidor.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "esta" {
  bucket = var.bucket
  policy = data.aws_iam_policy_document.autoriza.json
}


variable "conta_consumidora"   { type = string }
variable "recurso_destino_arn" { type = string }
variable "acoes" {
  type        = list(string)
  description = "o que o consumo exige"
  default     = ["s3:GetObject", "s3:PutObject"]
}
variable "bucket" { type = string }
