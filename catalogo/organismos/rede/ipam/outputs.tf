output "pool_ids" { value = { for k, p in aws_vpc_ipam_pool.ambiente : k => p.id } }
output "pool_arns" { value = { for k, p in aws_vpc_ipam_pool.ambiente : k => p.arn } }

# Os pools das regiões extras, com a chave composta que o `for_each` usa
# (`us-east-1/dev`). Ficam num output à parte, e não misturados em `pool_ids`,
# para que quem consome escolha a região de propósito em vez de por acidente de
# nome: pool da região errada não aloca, e o erro só aparece no apply.
output "pool_ids_por_regiao" {
  value = { for k, p in aws_vpc_ipam_pool.ambiente_por_regiao : k => p.id }
}

output "pool_arns_por_regiao" {
  value = { for k, p in aws_vpc_ipam_pool.ambiente_por_regiao : k => p.arn }
}
