# Organismo publicacao-decisao (06): a permissão de produzir o evento de
# decisão no barramento. O tópico é molécula do dono (topico-kafka, no deploy
# do domínio); aqui a identity policy de escrita na role do publicador.

resource "aws_iam_role_policy" "publica" {
  name = "publica-decisao"
  role = var.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:Connect"]
        Resource = var.cluster_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:DescribeTopic", "kafka-cluster:WriteData"]
        Resource = var.topicos_arns
      },
      {
        Effect   = "Allow"
        Action   = ["glue:GetSchemaVersion", "glue:GetSchemaByDefinition"]
        Resource = var.schemas_arns
      }
    ]
  })
}
