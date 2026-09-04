# Ligação politica-msk-cluster (01.1 §6, lado do dono): a cluster policy que
# autoriza contas consumidoras a criar conexão privada e consumir. Vive no
# live do barramento; o outro lado é politica-msk-consumidor.
#
# Dois tipos de consumidor atravessam a conta: quem entra por conexão privada
# (ESM, Lambda) precisa das ações de controle listadas em `contas_consumidoras`;
# quem fala o protocolo IAM direto com os brokers de outra conta (o conector do
# MSK Connect da conta de dados, pelo hub) precisa das ações `kafka-cluster:*`
# no cluster, nos tópicos e nos grupos, e a cluster policy é o único lugar onde
# o dono as concede a principal de fora. Os ARNs de tópico e grupo saem do ARN
# do cluster, e não de texto escrito na célula.

locals {
  prefixo_recurso = join(":", slice(split(":", var.cluster_arn), 0, 5))
  nome_cluster    = split("/", split(":", var.cluster_arn)[5])[1]
}

resource "aws_msk_cluster_policy" "esta" {
  cluster_arn = var.cluster_arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat([{
      Sid       = "ConsumidoresAutorizados"
      Effect    = "Allow"
      Principal = { AWS = var.contas_consumidoras }
      Action = [
        "kafka:CreateVpcConnection",
        "kafka:GetBootstrapBrokers",
        "kafka:DescribeCluster",
        "kafka:DescribeClusterV2"
      ]
      # Lista mesmo com um elemento só: no `concat` abaixo os statements
      # precisam do MESMO tipo, e os de conector trazem lista de tópico e de
      # grupo. Com string aqui, o Terraform recusa com "Inconsistent
      # conditional result types", que não diz onde está a diferença.
      Resource = [var.cluster_arn]
      }],
      length(var.conectores_arns) == 0 ? [] : [
        {
          Sid       = "ConectoresDeOutraContaConectam"
          Effect    = "Allow"
          Principal = { AWS = var.conectores_arns }
          Action    = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"]
          Resource  = [var.cluster_arn]
        },
        {
          Sid       = "ConectoresDeOutraContaLeem"
          Effect    = "Allow"
          Principal = { AWS = var.conectores_arns }
          # `CreateTopic` está aqui porque o worker do MSK Connect cria os
          # próprios tópicos internos de offset, status e configuração
          # (`__amazon_msk_connect_*`) no primeiro start. Sem ela o conector
          # nasce, fica em RUNNING por instantes e morre, e o erro só aparece
          # no log do worker, não no apply. O escopo continua sendo o que a
          # célula declarar em `topicos_dos_conectores`: se lá só houver tópico
          # de negócio, isto não cria nada a mais; quem quiser os internos
          # precisa listá-los, e é assim que a permissão fica visível.
          Action   = ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData", "kafka-cluster:WriteData", "kafka-cluster:CreateTopic"]
          Resource = [for t in var.topicos_dos_conectores : "${local.prefixo_recurso}:topic/${local.nome_cluster}/*/${t}"]
        },
        {
          Sid       = "ConectoresDeOutraContaCoordenam"
          Effect    = "Allow"
          Principal = { AWS = var.conectores_arns }
          Action    = ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"]
          Resource  = [for g in var.grupos_dos_conectores : "${local.prefixo_recurso}:group/${local.nome_cluster}/*/${g}"]
        }
      ]
    )
  })
}
