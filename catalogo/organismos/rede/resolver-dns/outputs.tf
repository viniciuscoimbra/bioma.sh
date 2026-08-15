output "inbound_ips" { value = aws_route53_resolver_endpoint.inbound.ip_address[*].ip }
output "zone_ids" { value = { for k, z in aws_route53_zone.privada : k => z.zone_id } }
output "regra_arns" { value = { for k, r in aws_route53_resolver_rule.interna : k => r.arn } }
output "regra_ids" { value = { for k, r in aws_route53_resolver_rule.interna : k => r.id } }
