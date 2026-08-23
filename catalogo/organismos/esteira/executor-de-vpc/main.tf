# Organismo executor-de-vpc (15·D2, 01.1 §3): o braço da esteira DENTRO de uma
# VPC, para a peça que só se aplica de lá.
#
# Por que existe: tópico Kafka e schema no registry se criam falando com o
# broker na 9098, que é privada do plano de rota. Nenhuma esteira alcançava
# isso, e a célula do tópico nasceu marcada `adiada` com a saída escrita à mão:
# "CloudShell em modo VPC". CloudShell é console, não tem API, e cada tópico
# novo custava uma pessoa clicando. O executor troca o clique por um projeto
# que a esteira dispara: o apply roda numa rede que alcança o broker, com role
# própria e credencial que nunca sai da AWS.
#
# Não é build de aplicação: é o mesmo terragrunt do repositório, rodando de
# dentro. Por isso a imagem é a padrão da AWS e o que ele faz vem do buildspec,
# que a célula declara.

resource "aws_security_group" "este" {
  name        = "executor-${var.nome}"
  description = "executor da esteira dentro da VPC ${var.nome}"
  vpc_id      = var.vpc_id

  # Sem entrada: ninguém inicia conversa com o executor. A saída é aberta
  # porque quem a recorta é o security group do destino (o do cluster admite o
  # deste executor, e é lá que a fronteira está escrita).
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "executor-${var.nome}" }
}

resource "aws_iam_role" "este" {
  name = "executor-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# O que o executor pode fazer é da célula, nomeado por extenso: este organismo
# não decide alcance. O que entra aqui é só o que TODO executor precisa para
# existir (log, rede, e ler o próprio artefato).
data "aws_iam_policy_document" "base" {
  statement {
    sid       = "EscreverOProprioLog"
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.este.arn}:*"]
  }

  # As interfaces de rede que o CodeBuild cria para entrar na VPC. A condição
  # amarra a criação às sub-redes declaradas: sem ela, a permissão vale para
  # qualquer sub-rede da conta.
  statement {
    sid       = "EntrarNaVpc"
    effect    = "Allow"
    actions   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface", "ec2:DescribeSubnets", "ec2:DescribeSecurityGroups", "ec2:DescribeVpcs", "ec2:DescribeDhcpOptions"]
    resources = ["*"]
  }

  statement {
    sid       = "AnexarAInterfaceNaSubRedeDeclarada"
    effect    = "Allow"
    actions   = ["ec2:CreateNetworkInterfacePermission"]
    resources = ["arn:aws:ec2:*:*:network-interface/*"]

    condition {
      test     = "StringEquals"
      variable = "ec2:Subnet"
      values   = [for s in var.subnet_ids : "arn:aws:ec2:${var.regiao}:${var.conta}:subnet/${s}"]
    }
  }

  statement {
    sid       = "LerOArtefatoDaEsteira"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:GetObjectVersion", "s3:ListBucket"]
    resources = [var.balde_artefatos_arn, "${var.balde_artefatos_arn}/*"]
  }
}

resource "aws_iam_role_policy" "base" {
  name   = "existir"
  role   = aws_iam_role.este.id
  policy = data.aws_iam_policy_document.base.json
}

# O alcance do trabalho, declarado pela célula e nunca por default: um executor
# que cria tópico não é o mesmo que aplica outra coisa, e a diferença mora aqui.
resource "aws_iam_role_policy" "trabalho" {
  count = var.politica_do_trabalho == null ? 0 : 1

  name   = "trabalho"
  role   = aws_iam_role.este.id
  policy = var.politica_do_trabalho
}

resource "aws_cloudwatch_log_group" "este" {
  name              = "/esteira/executor/${var.nome}"
  retention_in_days = var.retencao_dias
  kms_key_id        = var.kms_key_arn
}

resource "aws_codebuild_project" "este" {
  name          = "executor-${var.nome}"
  description   = "aplica de dentro da VPC o que a 9098 exige"
  service_role  = aws_iam_role.este.arn
  build_timeout = var.minutos_limite

  artifacts { type = "NO_ARTIFACTS" }

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    image        = var.imagem
    type         = "LINUX_CONTAINER"

    dynamic "environment_variable" {
      for_each = var.variaveis
      content {
        name  = environment_variable.key
        value = environment_variable.value
      }
    }
  }

  # A VPC é o ponto inteiro deste organismo: sem isto, o projeto roda na rede
  # da AWS e não enxerga o broker, que é exatamente o problema que ele resolve.
  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = var.subnet_ids
    security_group_ids = concat([aws_security_group.este.id], var.security_group_ids)
  }

  source {
    type      = "NO_SOURCE"
    buildspec = var.buildspec
  }

  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.este.name
    }
  }
}
