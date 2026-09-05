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
          # WriteDataIdempotently: o coordenador do sink Iceberg escreve no
          # tópico de controle com produtor transacional, e a transação pede
          # escrita idempotente no cluster (a outra ponta é a identity policy
          # do papel do conector, role-conector-msk).
          Action   = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster", "kafka-cluster:WriteDataIdempotently"]
          Resource = [var.cluster_arn]
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
        },
        {
          # O transactional-id do coordenador do sink (`coordinator-txn-<uuid>`):
          # sem esta autorização o produtor transacional morre em
          # `TransactionalIdAuthorizationException` e a tarefa cai (medido em
          # 2026-09-05 no sink de produção). Qualquer id, porque o uuid nasce a
          # cada arranque do conector.
          Sid       = "ConectoresDeOutraContaTransacionam"
          Effect    = "Allow"
          Principal = { AWS = var.conectores_arns }
          Action    = ["kafka-cluster:DescribeTransactionalId", "kafka-cluster:AlterTransactionalId"]
          Resource  = ["${local.prefixo_recurso}:transactional-id/${local.nome_cluster}/*/*"]
        }
      ],
      # OS PRODUTORES, e eles são lista à parte porque produzir não é consumir
      # ao contrário. Um produtor escreve num tópico e NÃO participa de grupo:
      # colocá-lo em `conectores_arns` daria a ele `ReadData` e coordenação de
      # partição sobre TUDO que os conectores leem, para autorizar uma escrita
      # num tópico só.
      #
      # Sem esta lista, a identity policy do lado de quem produz não basta: a
      # carga vive em OUTRA conta, e no MSK acesso entre contas exige as duas
      # pontas. Só a identity, o produtor toma `TopicAuthorizationException`,
      # que é exatamente o sintoma que ele estava tentando resolver.
      length(var.produtores_arns) == 0 ? [] : [
        {
          Sid       = "ProdutoresDeOutraContaConectam"
          Effect    = "Allow"
          Principal = { AWS = var.produtores_arns }
          # `WriteDataIdempotently` é do CLUSTER e não do tópico, e entra aqui
          # porque cliente com idempotência ligada (o padrão de vários) pede a
          # ação no cluster antes da primeira escrita. Sem ela o erro chega como
          # `ClusterAuthorizationException`, que não se parece com problema de
          # tópico e manda procurar no lugar errado.
          Action   = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster", "kafka-cluster:WriteDataIdempotently"]
          Resource = [var.cluster_arn]
        },
        {
          Sid       = "ProdutoresDeOutraContaEscrevem"
          Effect    = "Allow"
          Principal = { AWS = var.produtores_arns }
          # Sem `CreateTopic` e sem `ReadData`: quem produz escreve no tópico do
          # contrato, que a plataforma cria. Produtor que cria tópico sozinho é
          # como contrato nasce sem revisão.
          Action   = ["kafka-cluster:WriteData", "kafka-cluster:DescribeTopic"]
          Resource = [for t in var.topicos_dos_produtores : "${local.prefixo_recurso}:topic/${local.nome_cluster}/*/${t}"]
        }
      ]
    )
  })
}
