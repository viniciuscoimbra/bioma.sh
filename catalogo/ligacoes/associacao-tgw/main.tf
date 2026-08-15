# Ligação associacao-tgw: mesma execução, mesmo dono (rede), DUAS permissões
# distintas: ec2:AssociateTransitGatewayRouteTable e
# ec2:EnableTransitGatewayRouteTablePropagation. Attachment no plano errado é o
# incidente que a revisão por PR neste trilho impede.
#
# O attachment chega pela DEPENDÊNCIA, e não por consulta ao SSM. A consulta
# obrigava a célula a mockar o ARN para planejar antes de a VPC aplicar, e mock
# que alimenta `data` não é inerte: o provider resolve o data DURANTE o plano e
# chama a nuvem com o valor inventado. Três ligações desta árvore chamaram o
# SSM contra uma conta de exemplo, e a resposta foi AccessDenied. Valor que
# entra por variável só aparece no plano; o hormônio publicado pela VPC
# continua existindo, para quem lê em runtime.

resource "aws_ec2_transit_gateway_route_table_association" "esta" {
  transit_gateway_attachment_id  = var.attachment_id
  transit_gateway_route_table_id = var.route_table_id
}

resource "aws_ec2_transit_gateway_route_table_propagation" "propaga" {
  for_each = toset(var.propagar_para)

  transit_gateway_attachment_id  = var.attachment_id
  transit_gateway_route_table_id = each.value
}
