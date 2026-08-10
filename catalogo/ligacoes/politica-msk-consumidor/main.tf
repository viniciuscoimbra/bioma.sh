# Ligação politica-msk-consumidor (01.1 §6, lado de quem consome): a identity
# policy na role da função. kafka:DescribeVpcConnection na conexão é requisito
# do mapeamento de origem (ESM) entre contas; kafka-cluster:* autoriza o
# protocolo IAM no cluster, grupo e tópicos.

resource "aws_iam_role_policy" "consome" {
  name = "consome-msk-${var.sufixo}"
  role = var.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["kafka:DescribeVpcConnection"]
        Resource = var.vpc_connection_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka:ListVpcConnections", "kafka:DescribeCluster", "kafka:DescribeClusterV2", "kafka:GetBootstrapBrokers"]
        Resource = var.cluster_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"]
        Resource = var.cluster_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData"]
        Resource = var.topicos_arns
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"]
        Resource = var.grupos_arns
      }
    ]
  })
}
