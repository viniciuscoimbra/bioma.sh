output "pool_ids" { value = { for k, p in aws_vpc_ipam_pool.ambiente : k => p.id } }
output "pool_arns" { value = { for k, p in aws_vpc_ipam_pool.ambiente : k => p.arn } }
