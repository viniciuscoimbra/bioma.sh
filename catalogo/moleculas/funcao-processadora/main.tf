# Molécula funcao-processadora: quatro átomos que nascem e morrem juntos.
# Indivisibilidade por política lintada: role e log group dedicados. As
# versões seguintes do código são da esteira (corpo e comportamento): a
# receita ignora as mudanças que ela passa a governar, atributo a atributo.

resource "aws_iam_role" "permissao" {
  name = "${var.nome}-permissao"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.permissao.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "registro" {
  name              = "/aws/lambda/${var.nome}"
  retention_in_days = var.retencao_log_dias
  kms_key_id        = var.kms_key_arn
  tags              = var.tags
}

# A função nasce por imagem, do mesmo registro que a esteira publica. Era ZIP
# (`filename`/`source_code_hash`), e o artefato da esteira é a imagem com
# digest, escaneada no ECR antes de seguir: o ZIP não passa por registro nem
# por scan, e `package_type` não muda depois que a função existe, então a
# escolha de bootstrap é a que fica.
resource "aws_lambda_function" "funcao" {
  function_name = var.nome
  package_type  = "Image"
  image_uri     = var.imagem_inicial
  memory_size   = var.memoria_mb
  timeout       = var.timeout_s
  role          = aws_iam_role.permissao.arn
  tags          = var.tags

  dynamic "environment" {
    for_each = length(var.variaveis_de_ambiente) > 0 ? [1] : []
    content {
      variables = var.variaveis_de_ambiente
    }
  }

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  lifecycle {
    # a esteira governa o código depois do bootstrap; drift neste atributo
    # deixa de aparecer (o digest descreve a imagem conhecida)
    ignore_changes = [image_uri]
  }

  depends_on = [aws_cloudwatch_log_group.registro]
}

resource "aws_cloudwatch_metric_alarm" "alarme" {
  alarm_name          = "${var.nome}-erros"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 0
  evaluation_periods  = 1
  period              = 300
  dimensions          = { FunctionName = aws_lambda_function.funcao.function_name }
  alarm_actions       = var.alarm_actions
  tags                = var.tags
}
