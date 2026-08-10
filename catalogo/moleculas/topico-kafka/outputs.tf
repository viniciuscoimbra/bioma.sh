output "nome_topico" { value = kafka_topic.este.name }
output "schema_arn" { value = aws_glue_schema.contrato.arn }
