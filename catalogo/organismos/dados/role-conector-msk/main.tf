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
        Sid      = "UsaOGrupoDeConsumo"
        Effect   = "Allow"
        Action   = ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"]
        Resource = var.grupos_arns
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
        Sid      = "OProprioLog"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:log-group:/msk-connect/${var.conector}-${var.plano}:*"
      }
    ]
  })
}
