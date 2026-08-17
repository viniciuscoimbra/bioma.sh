output "api_id" { value = aws_api_gateway_rest_api.esta.id }
output "execution_arn" { value = aws_api_gateway_rest_api.esta.execution_arn }

# a raiz do caminho: quem compõe rotas sobre esta API pendura os recursos aqui,
# em vez de pedir o id da raiz por data source
output "root_resource_id" { value = aws_api_gateway_rest_api.esta.root_resource_id }
