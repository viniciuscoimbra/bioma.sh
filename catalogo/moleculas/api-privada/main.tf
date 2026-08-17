# Molécula api-privada: porta síncrona sem internet, autorização IAM (SigV4).
# O VPC endpoint execute-api é da vpc-dominio; chega por input (catálogo,
# caso do endpoint). Rotas e integrações são da aplicação (esteira).

resource "aws_api_gateway_rest_api" "esta" {
  name = var.nome
  tags = var.tags

  endpoint_configuration {
    types            = ["PRIVATE"]
    vpc_endpoint_ids = [var.vpc_endpoint_id]
  }

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "execute-api:Invoke"
        Resource  = "execute-api:/*"
        Condition = { StringEquals = { "aws:SourceVpce" = var.vpc_endpoint_id } }
      },
      {
        Effect    = "Deny"
        Principal = "*"
        Action    = "execute-api:Invoke"
        Resource  = "execute-api:/*"
        Condition = { StringNotEquals = { "aws:SourceVpce" = var.vpc_endpoint_id } }
      }
    ]
  })
}
