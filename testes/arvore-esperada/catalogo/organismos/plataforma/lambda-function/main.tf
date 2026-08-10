# Organismo lambda-function: recorta o evento
# Zona declarada no bloco: Plataforma · uma por plano (nao-prod, prod)
# Tecido: estavel (pode ser recriado do zero: o que ele guarda volta igual pela receita. Ainda assim só cai com janela declarada)
resource "aws_lambda_function" "lambda_function" {
  function_name                = var.lambda_function_function_name
  role                         = aws_iam_role.lambda_function.arn # ligado pelo bioma: mesma receita
}

resource "aws_iam_role" "lambda_function" {
  assume_role_policy           = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  }) # quem trabalha nesta receita pode assumir
}

resource "aws_cloudwatch_log_group" "lambda_function" {

}
