# Ligação grant-kms: o dono da chave concede o uso a um serviço consumidor.
# A réplica multi-region NÃO herda grants: consumo na região secundária pede
# um grant próprio, nesta mesma ligação, apontando o ARN da réplica.

resource "aws_kms_grant" "este" {
  name              = var.nome
  key_id            = var.key_arn
  grantee_principal = var.grantee_principal
  operations        = var.operacoes
}
