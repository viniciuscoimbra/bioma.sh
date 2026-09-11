output "endpoint_id" { value = aws_ec2_client_vpn_endpoint.esta.id }
output "vpc_terminacao" { value = aws_vpc.terminacao.id }

# O attachment da VPC de terminação, para a ligação associacao-tgw. O cabeçalho
# de main.tf promete que a rota de retorno entra por ela, e sem o id publicado
# a ligação não tinha o que associar: o attachment nascia fora de todo plano, o
# cliente conectava, e o pacote morria no hub sem erro nenhum.
output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.hub.id }
