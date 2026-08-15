output "vpc_id" { value = module.vpc.vpc_id }
output "cidr_block" { value = module.vpc.cidr_block }
output "subnet_ids" { value = module.vpc.subnet_ids }
output "attachment_parameter_arn" { value = module.vpc.attachment_parameter_arn }
output "attachment_id" { value = module.vpc.attachment_id }
output "security_group_id" { value = module.vpc.security_group_id }
