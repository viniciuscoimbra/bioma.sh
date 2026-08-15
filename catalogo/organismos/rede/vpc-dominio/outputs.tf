output "vpc_id" { value = aws_vpc.esta.id }

# o CIDR alocado pelo IPAM: a VPC par lê daqui para declarar esta em
# cidrs_permitidos, em vez de alguém digitar a faixa na célula
output "cidr_block" { value = aws_vpc.esta.cidr_block }
output "subnet_ids" { value = aws_subnet.privada[*].id }
output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.hub.id }
output "attachment_parameter_arn" { value = aws_ssm_parameter.attachment_id.arn }
output "execute_api_endpoint_id" { value = aws_vpc_endpoint.execute_api.id }
output "security_group_id" { value = aws_security_group.cargas.id }
