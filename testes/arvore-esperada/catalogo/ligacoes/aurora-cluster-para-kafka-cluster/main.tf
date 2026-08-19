# Ligação aurora-cluster-para-kafka-cluster: lançamento
# Por que é ligação: origem e destino em trilhos diferentes (folha-dois e folha-um): donos distintos pedem permissão dos dois lados
# Canal declarado no bloco: evento
#
# Ligação tem permissão dos DOIS lados e state próprio. Ela mora no live de
# quem tem a permissão de criar, que aqui é o trilho folha-um.

# O lado de quem consome: um papel com a permissão declarada.
resource "aws_iam_role" "consumidor" {
  name               = "aurora-cluster-para-kafka-cluster-consumidor"
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

# Este destino não tem recurso de política próprio: a permissão
# vive inteira no papel do consumidor, acima.

variable "conta_consumidora"   { type = string }
variable "recurso_destino_arn" { type = string }
variable "acoes" {
  type        = list(string)
  description = "o que o consumo exige"
  default     = ["a ação que o consumo exige"]
}
