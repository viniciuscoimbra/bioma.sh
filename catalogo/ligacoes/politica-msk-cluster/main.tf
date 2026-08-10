# Ligação politica-msk-cluster (01.1 §6, lado do dono): a cluster policy que
# autoriza contas consumidoras a criar conexão privada e consumir. Vive no
# live do barramento; o outro lado é politica-msk-consumidor.

resource "aws_msk_cluster_policy" "esta" {
  cluster_arn = var.cluster_arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "ConsumidoresAutorizados"
      Effect    = "Allow"
      Principal = { AWS = var.contas_consumidoras }
      Action = [
        "kafka:CreateVpcConnection",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeCluster",
        "kafka:DescribeClusterV2"
      ]
      Resource = var.cluster_arn
    }]
  })
}
