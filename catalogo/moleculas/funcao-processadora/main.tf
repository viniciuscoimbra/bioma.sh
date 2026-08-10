# Molécula funcao-processadora: quatro átomos que nascem e morrem juntos.
# Indivisibilidade por política lintada: role e log group dedicados. As
# versões seguintes do código são da esteira (corpo e comportamento): a
# receita ignora as mudanças que ela passa a governar, atributo a atributo.

resource "aws_iam_role" "permissao" {
  name = "${var.nome}-permissao"

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
}

resource "aws_lambda_function" "funcao" {
  function_name    = var.nome
  runtime          = "python3.13"
  handler          = "app.principal"
  memory_size      = var.memoria_mb
  timeout          = var.timeout_s
  role             = aws_iam_role.permissao.arn
  filename         = var.pacote_inicial
  source_code_hash = filebase64sha256(var.pacote_inicial)

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  lifecycle {
    # a esteira governa o código depois do bootstrap; drift nesses atributos
    # deixa de aparecer (aviso do artigo: o hash descreve o pacote conhecido)
    ignore_changes = [filename, source_code_hash]
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
}
