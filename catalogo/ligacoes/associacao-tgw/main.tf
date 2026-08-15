# Ligação associacao-tgw: mesma execução, mesmo dono (rede), DUAS permissões
# distintas: ec2:AssociateTransitGatewayRouteTable e
# ec2:EnableTransitGatewayRouteTablePropagation. O attachment chega por
# hormônio (ARN completo do parâmetro publicado pelo dono da VPC). Attachment
# no plano errado é o incidente que a revisão por PR neste trilho impede.

# O ARN do parâmetro é MONTADO, e não recebido da célula produtora.
#
# Recebê-lo por `dependency` obriga a célula a declarar `mock_outputs` para o
# plano de uma árvore que ainda não aplicou, e mock que alimenta `data` não é
# inerte: o provider resolve o data DURANTE o plano e chama a nuvem com o valor
# inventado. Três ligações desta árvore chamaram o SSM contra uma conta de
# exemplo dentro do ARN, e a resposta foi AccessDenied.
#
# O nome do parâmetro é convenção (`/dominios/<domínio>/<ambiente>/attachment-id`),
# a conta é a do domínio e a região é a da instituição: o ARN sai de dados que
# esta célula já tem. A ordem de execução continua declarada, por `dependencies`,
# que ordena sem trazer valor nenhum.
locals {
  attachment_parameter_arn = format(
    "arn:aws:ssm:%s:%s:parameter/dominios/%s/%s/attachment-id",
  var.regiao, var.conta_dominio, var.dominio, var.ambiente)
}

data "aws_ssm_parameter" "attachment_id" {
  name = local.attachment_parameter_arn
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
