output "endpoint_dns" {
  value = { for k, e in aws_vpc_endpoint.servico : k => e.dns_entry[0].dns_name }
}

output "zonas_de_servico" {
  value = { for k, z in aws_route53_zone.servico : k => z.zone_id }
}
