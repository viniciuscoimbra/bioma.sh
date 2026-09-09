# o id que a proposta de associação referencia (o comando está no runbook do
# passo 4): quem propõe do lado de cá aponta este TGW
output "tgw_id" { value = aws_ec2_transit_gateway.este.id }

output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.este.id }
output "subnet_ids" { value = aws_subnet.tgw[*].id }
