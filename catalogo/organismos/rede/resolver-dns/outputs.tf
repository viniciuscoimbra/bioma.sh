output "inbound_ips" { value = aws_route53_resolver_endpoint.inbound.ip_address[*].ip }
output "zone_ids" { value = { for k, z in aws_route53_zone.privada : k => z.zone_id } }
