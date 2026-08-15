output "associacoes" { value = { for k, a in aws_route53_zone_association.esta : k => a.id } }
