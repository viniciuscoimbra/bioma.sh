output "links" { value = { for k, l in aws_glue_catalog_database.link : k => l.arn } }
