# Organismo role-conector-msk (01.1, 04): o papel que o MSK Connect assume para
# ler o tópico e escrever no lake. O principal é `kafkaconnect.amazonaws.com`, e
# não `ecs-tasks` nem `glue`: papel de serviço não se empresta entre serviços.
#
# O conector lê os tópicos que a célula nomeia e escreve no balde que a célula
# nomeia. Nada de `Resource = "*"`: um sink que pode escrever em qualquer balde
# da conta é um caminho de saída de dado que ninguém desenhou.

resource "aws_iam_role" "conector" {
  name = "msk-connect-${var.conector}-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "kafkaconnect.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# A leitura do schema em OUTRA conta: o Schema Registry não aceita resource
# policy (medido em 2026-09-05: com a política do Glue posta na conta do
# barramento, o Glue seguiu respondendo "Schema is not found" à conta de
# dados). O caminho é o converter assumir o papel leitor do cartório
# (`value.converter.assumeRoleArn`), e este é o lado de cá: o conector pode
# assumir. Só nasce quando há papel a assumir.
resource "aws_iam_role_policy" "assume_o_cartorio" {
  count = length(var.papeis_assumiveis) > 0 ? 1 : 0
  name  = "conector-${var.conector}-assume-cartorio"
  role  = aws_iam_role.conector.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "AssumeOPapelLeitorDoCartorio"
      Effect   = "Allow"
      Action   = "sts:AssumeRole"
      Resource = var.papeis_assumiveis
    }]
  })
}

resource "aws_iam_role_policy" "o_que_o_conector_toca" {
  name = "conector-${var.conector}"
  role = aws_iam_role.conector.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ConectaNoCluster"
        Effect   = "Allow"
        Action   = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"]
        Resource = var.cluster_arn
      },
      {
        Sid      = "LeOsTopicosNomeados"
        Effect   = "Allow"
        Action   = ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData"]
        Resource = var.topicos_arns
      },
      {
        # O sink Iceberg coordena o commit entre workers por um tópico de
        # controle: ele lê e escreve nele. É o único tópico em que escreve.
        Sid      = "CoordenaPeloTopicoDeControle"
        Effect   = "Allow"
        Action   = ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData", "kafka-cluster:WriteData"]
        Resource = var.topicos_controle_arns
      },
      {
        # O coordenador do sink Iceberg escreve no tópico de controle com um
        # produtor TRANSACIONAL (transactionalId `coordinator-txn-<uuid>`), e o
        # MSK autoriza transação em dois recursos: o cluster (escrita
        # idempotente) e o transactional-id. Sem isto o produtor "transita para
        # estado fatal" com `TransactionalIdAuthorizationException` e a tarefa
        # morre (medido em 2026-09-05 no sink de produção). A outra ponta é a
        # cluster policy do barramento (ligação politica-msk-cluster).
        Sid      = "CoordenaComTransacao"
        Effect   = "Allow"
        Action   = ["kafka-cluster:WriteDataIdempotently"]
        Resource = var.cluster_arn
      },
      {
        Sid      = "UsaOTransactionalId"
        Effect   = "Allow"
        Action   = ["kafka-cluster:DescribeTransactionalId", "kafka-cluster:AlterTransactionalId"]
        Resource = "${replace(var.cluster_arn, ":cluster/", ":transactional-id/")}/*"
      },
      {
        Sid      = "UsaOGrupoDeConsumo"
        Effect   = "Allow"
        Action   = ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"]
        Resource = var.grupos_arns
      },
      {
        # O worker do MSK Connect guarda offset, status e configuração em
        # tópicos internos que ele mesmo cria no primeiro start
        # (`__amazon_msk_connect_offsets_<nome do conector>_<uuid>`, e os
        # equivalentes de status e config). Sem isto o conector é CRIADO e morre
        # no arranque com `TopicAuthorizationException`, e o apply do Terraform
        # falha com `UnknownKafkaConnectWorkerFailure`, que não fala em
        # permissão nenhuma: a razão só aparece no log do worker.
        #
        # Não passa pela célula, ao contrário dos tópicos de negócio, porque o
        # nome carrega um UUID que só existe DEPOIS da criação: não há como
        # listá-lo antes. O escopo continua estreito pelo prefixo da família de
        # conectores desta role (`<conector>-`), e não alcança os internos de
        # conector de outra família na mesma conta.
        Sid    = "OsTopicosInternosDoWorker"
        Effect = "Allow"
        Action = ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData",
        "kafka-cluster:WriteData", "kafka-cluster:CreateTopic"]
        Resource = ["arn:aws:kafka:*:*:topic/*/*/__amazon_msk_connect_*_${var.conector}-*"]
      },
      {
        # O mesmo vale para o grupo do herder
        # (`__amazon_msk_connect_cluster_<nome do conector>_<uuid>`), que
        # coordena os workers entre si e é distinto do grupo de consumo do
        # conector.
        Sid      = "OGrupoInternoDoWorker"
        Effect   = "Allow"
        Action   = ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"]
        Resource = ["arn:aws:kafka:*:*:group/*/*/__amazon_msk_connect_*_${var.conector}-*"]
      },
      {
        # O sink Iceberg não só escreve: ele lê o manifesto que escreveu antes
        # para saber onde continuar, e pergunta a região do balde na primeira
        # chamada. Sem `GetObject` e `GetBucketLocation` a escrita passa no
        # apply e o conector morre no primeiro commit de snapshot.
        Sid    = "EscreveELeNoBaldeDoDestino"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject",
          "s3:AbortMultipartUpload", "s3:ListBucket",
        "s3:GetBucketLocation"]
        Resource = [var.bucket_destino_arn, "${var.bucket_destino_arn}/*"]
      },
      {
        # O sink Iceberg cria e atualiza a tabela no Glue Data Catalog do bronze
        # a cada commit de snapshot: sem isto o dado chega ao S3 e o catálogo
        # não sabe. Só o banco nomeado pela célula, e nada de conta curinga.
        Sid    = "OCatalogoDoBronze"
        Effect = "Allow"
        Action = ["glue:GetDatabase", "glue:GetDatabases", "glue:CreateTable", "glue:UpdateTable",
          "glue:GetTable", "glue:GetTables", "glue:CreatePartition", "glue:BatchCreatePartition",
        "glue:GetPartition", "glue:GetPartitions", "glue:UpdatePartition"]
        Resource = var.recursos_do_catalogo
      },
      {
        # O AVRO dos tópicos tem schema no registry do barramento; o converter o
        # busca por id a cada schema novo. Leitura, e só do registry nomeado.
        Sid    = "LeOSchemaDoRegistry"
        Effect = "Allow"
        Action = ["glue:GetSchemaVersion", "glue:GetSchemaByDefinition", "glue:GetSchema",
        "glue:GetRegistry", "glue:ListSchemas", "glue:ListSchemaVersions"]
        Resource = var.registry_arns
      },
      {
        Sid      = "PegaOPlugin"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${var.plugin_bucket_arn}/*"
      },
      {
        # A chave do próprio plano: cifra o que o conector escreve no destino e
        # decifra o que ele lê de lá. Não alcança o balde de artefatos.
        Sid      = "AChaveDoPlano"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      },
      {
        # O balde de artefatos é da esteira e é cifrado com a chave dela, que é
        # uma só para os dois planos: artefato revisado é o mesmo binário em
        # não-produção e em produção, e duplicar a chave duplicaria a revisão.
        # A segmentação por plano continua de pé porque este `Decrypt` só vale
        # no contexto de cifra do balde de artefatos: o conector de não-produção
        # decifra o plugin e nada mais que ande sob a chave da esteira.
        #
        # As duas formas do contexto entram porque o balde tem Bucket Key
        # ligada: com ela o S3 chama o KMS uma vez por balde e manda o ARN do
        # balde; sem ela manda o ARN do objeto. Listar só a forma com `/*`
        # negaria o `Decrypt` justamente na configuração que está no ar.
        Sid      = "DecifraOPlugin"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.plugin_kms_key_arn
        Condition = {
          StringLike = {
            "kms:EncryptionContext:aws:s3:arn" = [var.plugin_bucket_arn, "${var.plugin_bucket_arn}/*"]
          }
        }
      },
      {
        Sid    = "OProprioLog"
        Effect = "Allow"
        Action = ["logs:CreateLogStream", "logs:PutLogEvents"]
        # um conector por tópico, todos da mesma família (`<conector>-<topico>-<plano>`):
        # a role é da família, e o log de cada um cabe no padrão
        Resource = "arn:aws:logs:*:*:log-group:/msk-connect/${var.conector}-*:*"
      }
    ]
  })
}
