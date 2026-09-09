output "orcamentos" {
  value       = [for b in aws_budgets_budget.dominio : b.name]
  description = "os orçamentos por domínio que existem"
}
