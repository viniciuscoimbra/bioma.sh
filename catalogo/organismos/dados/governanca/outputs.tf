output "database_bronze" { value = aws_glue_catalog_database.bronze.name }
output "database_silver" { value = aws_glue_catalog_database.silver.name }
output "role_registro_arn" { value = aws_iam_role.registro.arn }
output "lf_tags" { value = { for k, t in aws_lakeformation_lf_tag.classificacao : k => t.values } }
