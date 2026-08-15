output "role_arn" { value = aws_iam_role.jobs.arn }
output "role_nome" { value = aws_iam_role.jobs.name }

# O job precisa deste nome em `--continuous-log-logGroup`: é o único grupo que
# a política da role alcança.
output "log_group_nome" { value = aws_cloudwatch_log_group.jobs.name }
