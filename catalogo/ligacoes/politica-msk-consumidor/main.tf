# Ligação politica-msk-consumidor (01.1 §6, lado de quem consome): a identity
# policy na role da função. kafka:DescribeVpcConnection na conexão é requisito
# do mapeamento de origem (ESM) entre contas; kafka-cluster:* autoriza o
# protocolo IAM no cluster, grupo e tópicos.

resource "aws_iam_role_policy" "consome" {
  name = "consome-msk-${var.sufixo}"
  role = var.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      # a conexão privada existe quando o consumidor é ESM/Lambda em outra VPC;
      # o conector do MSK Connect chega pelo hub, sem conexão, e a lista fica vazia
      var.vpc_connection_arn == "" ? [] : [{
        Effect   = "Allow"
        Action   = ["kafka:DescribeVpcConnection"]
        Resource = var.vpc_connection_arn
      }],
      [
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
      ],
      # Quem lê Avro do barramento precisa do schema, e o cartório (Glue Schema
      # Registry) mora na conta do barramento e não aceita resource policy: o
      # consumidor assume o papel leitor que o registry-schemas publica
      # (registry-leitor-<plano>). Vazio para quem não lê Avro (2026-09-06).
      var.registry_assume_role_arn == "" ? [] : [{
        Effect   = "Allow"
        Action   = ["sts:AssumeRole"]
        Resource = var.registry_assume_role_arn
      }]
    )
  })
}
