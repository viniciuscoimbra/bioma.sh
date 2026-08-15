output "vpc_id" { value = aws_vpc.esta.id }

# o CIDR alocado pelo IPAM: a VPC par lê daqui para declarar esta em
# cidrs_permitidos, em vez de alguém digitar a faixa na célula
output "cidr_block" { value = aws_vpc.esta.cidr_block }
# por camada, que é como quem consome pede: o cluster quer as de contêiner, o
# banco quer as de dados
output "subnet_ids_por_camada" {
  value = { for nome in keys(var.camadas) :
    nome => [for k, s in aws_subnet.camada : s.id if local.sub_redes[k].camada == nome]
  }
}

output "cidrs_por_camada" {
  value = { for nome in keys(var.camadas) :
    nome => [for k, s in aws_subnet.camada : s.cidr_block if local.sub_redes[k].camada == nome]
  }
}

output "subnet_ids" {
  # compatibilidade: quem pede "as sub-redes" sem dizer qual camada recebe as
  # da camada dos endpoints, que é a de uso geral por convenção
  value = [for k, s in aws_subnet.camada : s.id if local.sub_redes[k].camada == var.camada_dos_endpoints]
}
output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.hub.id }
output "attachment_parameter_arn" { value = aws_ssm_parameter.attachment_id.arn }
output "execute_api_endpoint_id" { value = aws_vpc_endpoint.execute_api.id }
output "security_group_id" { value = aws_security_group.cargas.id }
