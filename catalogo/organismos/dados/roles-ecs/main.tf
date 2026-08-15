# Organismo roles-ecs (04): os dois papéis que uma tarefa de ECS precisa, e que
# não são o mesmo. A execução é do agente: ele puxa a imagem do ECR e abre o
# log antes de a tarefa existir. A tarefa é do processo: é ela que fala com o
# catálogo e com o lake depois de subir.
#
# Trocar um pelo outro dá permissão de aplicação ao agente ou tira do processo
# o que ele precisa, e o Terraform aceita os dois porque ambos são ARN de role.
# Por isso as duas nascem aqui, com nome diferente e política diferente.

resource "aws_iam_role" "execucao" {
  name = "ecs-execucao-${var.servico}-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# A política gerenciada da AWS para execução de tarefa é exatamente o mínimo do
# agente (puxar imagem, abrir log) e é mantida pela própria AWS quando o
# serviço muda. Reescrever à mão aqui seria copiar para desatualizar. Ela abre
# stream e escreve evento, e não cria grupo: por isso o grupo nasce logo abaixo.
resource "aws_iam_role_policy_attachment" "execucao_padrao" {
  role       = aws_iam_role.execucao.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execucao_chave" {
  name = "chave-do-repositorio"
  role = aws_iam_role.execucao.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "DecifraAImagem"
      Effect   = "Allow"
      Action   = ["kms:Decrypt"]
      Resource = var.kms_key_arn
    }]
  })
}

# O grupo de log nasce aqui, junto da role que escreve nele. O driver `awslogs`
# não cria grupo (só com `awslogs-create-group`, que a tarefa não liga) e a
# política gerenciada de execução não tem `CreateLogGroup`: sem este recurso a
# tarefa nem arranca, e o erro aparece como falha de agente, longe da causa.
# Criar em vez de conceder `CreateLogGroup` mantém a retenção declarada.
resource "aws_cloudwatch_log_group" "tarefa" {
  name              = "/ecs/${var.servico}-${var.plano}"
  retention_in_days = var.retencao_log_dias
}

resource "aws_iam_role" "tarefa" {
  name = "ecs-tarefa-${var.servico}-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

locals {
  # 0 ou 1: quantas vezes os trechos de balde entram na política.
  tem_balde = length(var.baldes_arns) == 0 ? 0 : 1
}

resource "aws_iam_role_policy" "o_que_o_processo_toca" {
  name = "tarefa-${var.servico}"
  role = aws_iam_role.tarefa.id

  policy = jsonencode({
    Version = "2012-10-17"
    # Cada trecho é uma lista de um tipo só. Um ternário entre `[]` e uma lista
    # de objetos com atributos de tipos diferentes (Resource ora string, ora
    # lista) não unifica, e o erro só aparece no apply.
    Statement = concat([
      {
        Sid    = "LeOCatalogo"
        Effect = "Allow"
        Action = ["glue:GetDatabase", "glue:GetDatabases", "glue:GetTable",
        "glue:GetTables", "glue:GetPartitions"]
        Resource = var.recursos_do_catalogo
      }
      ],
      [for _ in range(local.tem_balde) : {
        Sid      = "LeOsBaldes"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = concat(var.baldes_arns, [for b in var.baldes_arns : "${b}/*"])
      }],
      # Ler objeto cifrado exige a chave, e não só a permissão de S3. Sem isto,
      # a permissão de leitura passa no apply e falha na primeira requisição,
      # que é o pior lugar para descobrir: as camadas do lake são todas SSE-KMS.
      [for _ in range(local.tem_balde) : {
        Sid      = "DecifraOQueLe"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:DescribeKey"]
        Resource = [var.kms_key_arn]
    }])
  })
}
