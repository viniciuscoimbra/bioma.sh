# A URL que o pipeline comenta no pull request. É o único sítio de ligação
# desta receita: o resto do que ela cria morre com o PR e não é consumido por
# ninguém de fora.
output "url" { value = "https://${local.fqdn}" }

output "fqdn" { value = local.fqdn }
output "nome_da_funcao" { value = module.funcao.nome_da_funcao }
output "api_id" { value = module.api.api_id }
