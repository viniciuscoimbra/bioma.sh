# Organismo role-jobs-glue (04.1): o papel que os jobs do Glue assumem para
# escrever a camada de dado que a célula nomeia. Ele existia como ARN escrito à
# mão em oito células, apontando para uma role que nenhuma receita criava.
#
# A receita não sabe qual camada é: no domínio ela recebe o gold daquele
# domínio, e na plataforma recebe o silver. Por isso as variáveis falam de
# `bucket` e `dono`, e não de `gold`: nome de variável que promete uma camada e
# recebe outra é código que mente para quem abrir depois.
#
# O menor privilégio aqui é uma lista, e não um curinga: o job lê e escreve o
# balde do próprio domínio, fala com o catálogo do próprio banco, usa a chave
# do próprio domínio e escreve o log dele. Nada além disso, e cada linha diz
# qual recurso alcança.

resource "aws_iam_role" "jobs" {
  name = "glue-jobs-${var.dono}-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "glue.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { dominio = var.dono, ambiente = var.ambiente }
}

# O grupo de log nasce aqui, e a role não ganha `logs:CreateLogGroup`. Duas
# razões: o Glue não cria o grupo do job por conta própria, e sem ele o
# `CreateLogStream` falha no primeiro run; e grupo que aparece por efeito
# colateral nasce sem expiração, guardando log de job para sempre e sem dono.
# A retenção fica declarada, no arquivo, ao lado da permissão que a usa.
#
# O job precisa apontar `--continuous-log-logGroup` para este nome: o Glue
# escreve nos grupos padrão (`/aws-glue/jobs/output`) quando ninguém diz o
# contrário, e a política abaixo não alcança esses. O nome sai no output.
resource "aws_cloudwatch_log_group" "jobs" {
  name              = "/aws-glue/jobs/${var.dono}-${var.ambiente}"
  retention_in_days = var.retencao_log_dias

  tags = { dominio = var.dono, ambiente = var.ambiente }
}

resource "aws_iam_role_policy" "o_que_o_job_toca" {
  name = "jobs-${var.dono}"
  role = aws_iam_role.jobs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat([
      {
        Sid      = "OProprioBalde"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [var.bucket_arn, "${var.bucket_arn}/*"]
      },
      {
        Sid    = "OProprioCatalogo"
        Effect = "Allow"
        Action = ["glue:GetDatabase", "glue:GetTable", "glue:GetTables",
          "glue:GetPartition", "glue:GetPartitions",
        "glue:CreateTable", "glue:UpdateTable", "glue:BatchCreatePartition"]
        Resource = var.recursos_do_catalogo
      },
      {
        Sid      = "AChaveDoDominio"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      },
      {
        # Só o grupo deste dono e deste ambiente, e só escrita: a role não lê
        # log de ninguém e não alcança o grupo de outro domínio.
        Sid      = "OProprioLog"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.jobs.arn}:*"
      }
      ],
      # A camada de origem, só leitura: o job Silver lê o bronze, o job Gold lê
      # o silver. Escrever na origem seria reescrever o que outro trilho
      # aterrissou, e nenhuma receita pede isso. Statement sem recurso é
      # política malformada, por isso a lista vazia não gera statement.
      length(var.buckets_leitura_arns) == 0 ? [] : [{
        Sid      = "ACamadaDeOrigem"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket", "s3:GetBucketLocation"]
        Resource = flatten([for arn in var.buckets_leitura_arns : [arn, "${arn}/*"]])
      }],
      # O script do job mora fora do balde de dado (a esteira publica o .py no
      # balde de artefatos), e o Glue busca esse objeto com a role do job. Sem
      # esta permissão o job morre no arranque, antes de tocar em dado algum.
      # É leitura de objeto e nada mais: quem publica script é a esteira, e um
      # job que escreve no próprio script reescreve o que a revisão aprovou.
      var.script_bucket_arn == "" ? [] : [{
        Sid      = "LeOScriptDoJob"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${var.script_bucket_arn}/*"
      }],
      # O balde de artefatos é cifrado com a chave de quem o publica, que não é
      # a chave do domínio. A condição prende este `Decrypt` ao contexto de
      # cifra do próprio balde de script: a role decifra o script, e não
      # qualquer outro ciphertext que ande sob a mesma chave. As duas formas do
      # contexto entram porque balde com Bucket Key ligada manda o ARN do balde
      # ao KMS, e sem ela manda o ARN do objeto.
      var.script_kms_key_arn == "" ? [] : [{
        Sid      = "DecifraOScriptDoJob"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.script_kms_key_arn
        Condition = {
          StringLike = {
            "kms:EncryptionContext:aws:s3:arn" = [var.script_bucket_arn, "${var.script_bucket_arn}/*"]
          }
        }
    }])
  })
}
