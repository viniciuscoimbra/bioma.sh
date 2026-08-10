# Organismo entrega-logs-central (14): o destination do CloudWatch Logs na
# conta de dados. As contas fonte assinam pela ligação subscricao-logs; a
# access policy diz quem pode assinar. O destino físico é o Firehose do
# telemetria-raw.

resource "aws_iam_role" "destination" {
  name = "logs-destination-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "logs.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "encaminha" {
  name = "encaminha-firehose"
  role = aws_iam_role.destination.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["firehose:PutRecord", "firehose:PutRecordBatch"]
      Resource = var.firehose_arn
    }]
  })
}

resource "aws_cloudwatch_log_destination" "central" {
  name       = "logs-central-${var.plano}"
  role_arn   = aws_iam_role.destination.arn
  target_arn = var.firehose_arn
}

resource "aws_cloudwatch_log_destination_policy" "quem_assina" {
  destination_name = aws_cloudwatch_log_destination.central.name

  access_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = var.contas_fonte }
      Action    = "logs:PutSubscriptionFilter"
      Resource  = aws_cloudwatch_log_destination.central.arn
    }]
  })
}
