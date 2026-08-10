output "key_arn" { value = aws_kms_key.primaria.arn }
output "replica_arn" { value = aws_kms_replica_key.replica.arn }
output "parameter_arn" { value = aws_ssm_parameter.arn.arn }
