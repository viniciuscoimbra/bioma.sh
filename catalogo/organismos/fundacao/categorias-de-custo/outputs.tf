output "arn_dominio" {
  value       = aws_ce_cost_category.dominio.id
  description = "ARN da categoria Dominio, para quem consultar o Cost Explorer por ela"
}

output "arn_natureza" {
  value       = aws_ce_cost_category.natureza.id
  description = "ARN da categoria Natureza"
}

output "arn_ambiente" {
  value       = aws_ce_cost_category.ambiente.id
  description = "ARN da categoria Ambiente"
}

output "politica_de_paineis" {
  value       = aws_iam_policy.ver_paineis.name
  description = "nome da politica de leitura dos paineis, para o Identity Center anexar"
}
