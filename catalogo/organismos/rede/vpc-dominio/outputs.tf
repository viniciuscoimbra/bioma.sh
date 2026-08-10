output "vpc_id" { value = aws_vpc.esta.id }
output "subnet_ids" { value = aws_subnet.privada[*].id }
output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.hub.id }
output "attachment_parameter_arn" { value = aws_ssm_parameter.attachment_id.arn }
output "execute_api_endpoint_id" { value = aws_vpc_endpoint.execute_api.id }
