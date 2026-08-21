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

# As tabelas de rota, por camada e a do attachment. Quem precisa delas é a
# célula que abre um segundo caminho de saída nesta VPC, com destino que não vai
# pelo hub: a rota mora na tabela daqui, e sem o id publicado ela nasce de um
# `rtb-` digitado, que é o mesmo erro que `subnet_ids_por_camada` existe para
# não repetir — identificador copiado à mão aponta para a tabela da outra
# camada e nada no plano acusa.
#
# Escrever a rota de outro state é seguro porque as rotas daqui são `aws_route`
# separados, e não bloco `route` dentro de `aws_route_table`: o que vem de fora
# convive, em vez de ser apagado a cada apply.
output "route_table_ids_por_camada" {
  value = { for nome, rt in aws_route_table.camada : nome => rt.id }
}

output "route_table_id_tgw" { value = aws_route_table.tgw.id }

# As sub-redes do attachment, uma por zona. São as que o attachment ao hub usa,
# e quem anexar esta VPC a um segundo Transit Gateway decide na célula se reusa
# ou não; sem o output, a decisão vira índice de lista contado à mão.
output "subnet_ids_tgw" { value = aws_subnet.tgw[*].id }

output "attachment_id" { value = aws_ec2_transit_gateway_vpc_attachment.hub.id }
output "attachment_parameter_arn" { value = aws_ssm_parameter.attachment_id.arn }
output "execute_api_endpoint_id" { value = aws_vpc_endpoint.execute_api.id }
output "security_group_id" { value = aws_security_group.cargas.id }
