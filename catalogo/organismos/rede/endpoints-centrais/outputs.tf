output "endpoint_dns" {
  value = { for k, e in aws_vpc_endpoint.servico : k => e.dns_entry[0].dns_name }
}
