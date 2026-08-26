output "rotas" { value = { for k, r in aws_ec2_transit_gateway_route.default : k => r.id } }
