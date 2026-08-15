# Organismo store-propostas (06): o estado das propostas em DynamoDB, com
# trilha por stream (auditoria da decisão consome). Durabilidade permanente.

resource "aws_dynamodb_table" "propostas" {
  name         = "propostas-${var.ambiente}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "propostaId"
  range_key    = "momento"

  attribute {
    name = "propostaId"
    type = "S"
  }

  attribute {
    name = "momento"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  lifecycle { prevent_destroy = true }
}
