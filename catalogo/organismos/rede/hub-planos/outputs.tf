output "tgw_id" { value = aws_ec2_transit_gateway.hub.id }
output "route_table_ids" {
  value = { for k, rt in aws_ec2_transit_gateway_route_table.plano : k => rt.id }
}
output "tgw_id_parameter_arn" { value = aws_ssm_parameter.tgw_id.arn }
# O ARN do próprio hub, para o RAM: attachment de conta membro só existe se o
# TGW estiver compartilhado com ela, e compartilhar o parâmetro SSM que carrega
# o id não compartilha o gateway. Um diz onde o hub está; o outro dá o direito
# de se pendurar nele.
output "tgw_arn" { value = aws_ec2_transit_gateway.hub.arn }
