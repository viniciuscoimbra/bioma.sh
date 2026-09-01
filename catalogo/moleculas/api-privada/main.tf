# Molécula api-privada: porta síncrona sem internet, autorização IAM (SigV4).
# O VPC endpoint execute-api é da vpc-dominio; chega por input (catálogo,
# caso do endpoint). Rotas e integrações são da aplicação (esteira).

# Onde esta instalação roda. Entram na policy abaixo para que o que se declara
# seja exatamente o que a AWS guarda.
data "aws_region" "esta" {}
data "aws_caller_identity" "esta" {}

resource "aws_api_gateway_rest_api" "esta" {
  name = var.nome
  tags = var.tags

  endpoint_configuration {
    types            = ["PRIVATE"]
    vpc_endpoint_ids = [var.vpc_endpoint_id]
  }

  # O `Resource` é o ARN inteiro, e não a forma curta `execute-api:/*`, por um
  # motivo que só aparece no SEGUNDO plano: a AWS aceita a forma curta e guarda
  # a longa, então todo plano seguinte propõe "1 to change" para reescrever a
  # policy de volta. Ruído permanente, que não muda nada e esconde a mudança de
  # verdade no meio dele.
  #
  # O id da API não entra: seria referência ao próprio recurso que está sendo
  # criado, e o Terraform recusa o ciclo. O `*` no lugar dele não alarga nada,
  # porque resource policy de API Gateway só vale para a API que a carrega, e a
  # condição de VPC endpoint abaixo continua sendo o que de fato tranca.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "execute-api:Invoke"
        Resource  = "arn:aws:execute-api:${data.aws_region.esta.region}:${data.aws_caller_identity.esta.account_id}:*/*"
        Condition = { StringEquals = { "aws:SourceVpce" = var.vpc_endpoint_id } }
      },
      {
        Effect    = "Deny"
        Principal = "*"
        Action    = "execute-api:Invoke"
        Resource  = "arn:aws:execute-api:${data.aws_region.esta.region}:${data.aws_caller_identity.esta.account_id}:*/*"
        Condition = { StringNotEquals = { "aws:SourceVpce" = var.vpc_endpoint_id } }
      }
    ]
  })
}
