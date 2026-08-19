output "nome_topico" { value = kafka_topic.este.name }
output "schema_arn" { value = one(aws_glue_schema.contrato[*].arn) }
output "schema_nome" { value = one(aws_glue_schema.contrato[*].schema_name) }
