# Organismo chave-dominio (03·D3, 00·D3): uma chave por domínio E ambiente.
# Primária na residência, réplica na secundária: mesmo material e mesmo id,
# ARN e policy PRÓPRIOS (a réplica não herda grants). É a réplica que mantém a
# cópia de backup legível quando a primária está indisponível. Uso entre contas
# exige key policy aqui E grant/IAM no consumidor (ligação grant-kms).

resource "aws_kms_key" "primaria" {
  description             = "chave ${var.dominio}-${var.ambiente} (primária)"
  multi_region            = true
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = var.key_policy_json

  lifecycle { prevent_destroy = true }
}

resource "aws_kms_alias" "primaria" {
  name          = "alias/${var.dominio}-${var.ambiente}"
  target_key_id = aws_kms_key.primaria.key_id
}

resource "aws_kms_replica_key" "replica" {
  provider = aws.secundaria

  description             = "chave ${var.dominio}-${var.ambiente} (réplica)"
  primary_key_arn         = aws_kms_key.primaria.arn
  deletion_window_in_days = 30
  policy                  = var.key_policy_json

  lifecycle { prevent_destroy = true }
}

resource "aws_kms_alias" "replica" {
  provider = aws.secundaria

  name          = "alias/${var.dominio}-${var.ambiente}"
  target_key_id = aws_kms_replica_key.replica.key_id
}

# o hormônio: o domínio descobre a chave pelo ARN, nunca a contém
resource "aws_ssm_parameter" "arn" {
  name  = "/seguranca/chaves/${var.dominio}/${var.ambiente}"
  type  = "String"
  tier  = "Advanced"
  value = aws_kms_key.primaria.arn
}
