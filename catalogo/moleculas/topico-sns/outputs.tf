output "arn" { value = aws_sns_topic.este.arn }

output "nome" {
  description = "o nome em uso na AWS; no FIFO ele carrega o sufixo que a receita acrescentou"
  value       = aws_sns_topic.este.name
}

output "assinaturas" {
  description = "ARN da assinatura por \"<protocolo>:<destino>\"; e-mail ainda por confirmar aparece como PendingConfirmation"
  value       = { for k, a in aws_sns_topic_subscription.assinatura : k => a.arn }
}
