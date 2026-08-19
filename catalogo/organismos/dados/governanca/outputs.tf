output "database_bronze" { value = aws_glue_catalog_database.bronze.name }
output "database_silver" { value = aws_glue_catalog_database.silver.name }
# domínio => nome do database da camada; é o que o sink e o job recebem
output "databases_bronze" { value = { for d, db in aws_glue_catalog_database.bronze_dominio : d => db.name } }
output "databases_silver" { value = { for d, db in aws_glue_catalog_database.silver_dominio : d => db.name } }
output "role_registro_arn" { value = aws_iam_role.registro.arn }
output "lf_tags" { value = { for k, t in aws_lakeformation_lf_tag.classificacao : k => t.values } }
