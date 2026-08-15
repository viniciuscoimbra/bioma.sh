# O que o canal consome: o emissor OIDC e o cliente. O identificador do pool não
# é segredo, e é por ele que o API Gateway valida o token.
output "user_pool_id" { value = aws_cognito_user_pool.clientes.id }
output "user_pool_arn" { value = aws_cognito_user_pool.clientes.arn }
output "emissor_oidc" { value = "https://cognito-idp.${data.aws_region.esta.region}.amazonaws.com/${aws_cognito_user_pool.clientes.id}" }
output "client_id" { value = aws_cognito_user_pool_client.canal.id }
