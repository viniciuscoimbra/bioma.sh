output "namespace_nome" { value = aws_redshiftserverless_namespace.este.namespace_name }
output "workgroup_nome" { value = aws_redshiftserverless_workgroup.este.workgroup_name }
# O principal a quem o dono do produto concede o grant (acesso-lake).
output "role_lake_arn" { value = aws_iam_role.lake.arn }
