# Molécula tunel-de-porta: o caminho até um serviço que não tem rota para fora.
#
# Banco, endpoint de cluster e broker moram em sub-rede sem saída, e quem
# administra trabalha de fora com ferramenta gráfica. O Session Manager
# atravessa isso sem abrir porta na rede: a máquina saltadora já fala com o
# serviço, e o túnel usa o canal dela.
#
# O documento fixa o destino. O documento pronto da AWS
# (`AWS-StartPortForwardingSessionToRemoteHost`) recebe host e porta como
# parâmetro, e o IAM não tem condição para prendê-los: quem o tivesse tunelaria
# da saltadora para qualquer coisa que ela alcança, que numa VPC de produção é
# tudo. Aqui o destino está no conteúdo do documento, e a política aponta o
# documento.
#
# O que este caminho NÃO faz é gravar o que passou: um túnel não tem terminal
# para transcrever. Por isso ele é peça própria e não um modo do acesso
# gravado, e quem recebe um não recebe o outro por tabela.

resource "aws_ssm_document" "tunel" {
  name            = "tunel-${var.nome}"
  document_type   = "Session"
  document_format = "JSON"

  content = jsonencode({
    schemaVersion = "1.0"
    description   = "tunel para ${var.nome}"
    sessionType   = "Port"
    parameters = {
      # A porta local é de quem abre o túnel: a porta do serviço já está presa
      # abaixo, e prender também a local só atrapalha quem já usa aquela porta
      # na própria máquina.
      localPortNumber = {
        type        = "String"
        description = "porta na maquina de quem abre"
        default     = tostring(var.porta)
      }
    }
    properties = {
      host            = var.host
      portNumber      = tostring(var.porta)
      localPortNumber = "{{localPortNumber}}"
    }
  })
}

data "aws_iam_policy_document" "uso" {
  # A saltadora é escolhida por etiqueta, e não por id: máquina trocada não
  # pode obrigar a reescrever a política de quem usa o túnel.
  statement {
    sid       = "SaltarPelaMaquinaEtiquetada"
    effect    = "Allow"
    actions   = ["ssm:StartSession"]
    resources = ["arn:aws:ec2:*:*:instance/*"]

    condition {
      test     = "StringEquals"
      variable = "ssm:resourceTag/${var.etiqueta}"
      values   = var.valores_da_etiqueta
    }
  }

  statement {
    sid       = "SomenteEsteDestino"
    effect    = "Allow"
    actions   = ["ssm:StartSession"]
    resources = [aws_ssm_document.tunel.arn]
  }

  statement {
    sid       = "CuidarDaPropriaSessao"
    effect    = "Allow"
    actions   = ["ssm:TerminateSession", "ssm:ResumeSession"]
    resources = ["arn:aws:ssm:*:*:session/$${aws:username}-*"]
  }

  statement {
    sid       = "AberturaDoCanal"
    effect    = "Allow"
    actions   = ["ssm:DescribeSessions", "ssm:GetConnectionStatus", "ec2:DescribeInstances"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "uso" {
  # Nome-contrato, igual em toda conta, pela mesma razão da política do banco.
  name        = var.nome_politica
  description = "abrir tunel ate ${var.nome}, e nada mais"
  policy      = data.aws_iam_policy_document.uso.json
}
