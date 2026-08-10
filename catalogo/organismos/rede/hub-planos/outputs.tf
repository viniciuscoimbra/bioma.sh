output "tgw_id" { value = aws_ec2_transit_gateway.hub.id }
output "route_table_ids" {
  value = { for k, rt in aws_ec2_transit_gateway_route_table.plano : k => rt.id }
}
output "tgw_id_parameter_arn" { value = aws_ssm_parameter.tgw_id.arn }
