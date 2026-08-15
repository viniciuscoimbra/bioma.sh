output "tabela" { value = aws_dynamodb_table.propostas.name }
output "stream_arn" { value = aws_dynamodb_table.propostas.stream_arn }
