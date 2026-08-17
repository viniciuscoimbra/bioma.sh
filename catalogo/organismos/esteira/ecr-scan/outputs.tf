output "repository_urls" { value = { for k, r in aws_ecr_repository.repo : k => r.repository_url } }

# ARN, e não só a URL: quem escreve uma policy de IAM (Resource) precisa do
# ARN — a URL do registro não serve como Resource de statement nenhum. Sem
# este output, o consumidor teria que remontar o ARN a partir da URL (região e
# conta embutidas na string), frágil e redundante com o que o provider já
# devolve pronto.
output "repository_arns" { value = { for k, r in aws_ecr_repository.repo : k => r.arn } }
