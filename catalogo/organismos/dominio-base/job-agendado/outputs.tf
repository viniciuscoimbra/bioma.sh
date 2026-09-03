# O nome é o que a esteira usa em `update-function-code` e `update-alias`, e o
# alias é o alvo estável que ela reaponta. Os dois juntos são o contrato com o
# pipeline de deploy.
output "nome_da_funcao" { value = module.funcao.nome_da_funcao }

output "alias" { value = aws_lambda_alias.este.name }

output "funcao_arn" { value = module.funcao.funcao_arn }

# A role, para a célula acrescentar a permissão que só aquele job usa. É a
# mesma razão do irmão efêmero: "job" nomeia tudo que não é porta nem fila, e a
# receita não adivinha o que cada um faz.
output "permissao_nome" { value = module.funcao.permissao_nome }

# O nome da agenda, para quem for ligá-la ou desligá-la fora do Terraform (um
# incidente em que o job precisa parar agora não espera um apply).
output "nome_da_agenda" { value = aws_scheduler_schedule.agenda.name }
