# Ligação associacao-tgw: mesma execução, mesmo dono (rede), DUAS permissões
# distintas: ec2:AssociateTransitGatewayRouteTable e
# ec2:EnableTransitGatewayRouteTablePropagation. O attachment chega por
# hormônio (ARN completo do parâmetro publicado pelo dono da VPC). Attachment
# no plano errado é o incidente que a revisão por PR neste trilho impede.

data "aws_ssm_parameter" "attachment_id" {
  name = var.attachment_parameter_arn
}

resource "aws_ec2_transit_gateway_route_table_association" "esta" {
  transit_gateway_attachment_id  = data.aws_ssm_parameter.attachment_id.value
  transit_gateway_route_table_id = var.route_table_id
}

resource "aws_ec2_transit_gateway_route_table_propagation" "propaga" {
  for_each = toset(var.propagar_para)

  transit_gateway_attachment_id  = data.aws_ssm_parameter.attachment_id.value
  transit_gateway_route_table_id = each.value
}
