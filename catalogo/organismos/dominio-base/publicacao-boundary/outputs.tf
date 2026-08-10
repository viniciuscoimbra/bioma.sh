output "parameter_arns" { value = { for k, p in aws_ssm_parameter.publicacao : k => p.arn } }
