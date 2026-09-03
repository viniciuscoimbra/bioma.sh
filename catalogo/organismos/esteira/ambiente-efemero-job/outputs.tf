# O ARN da função é o sítio de ligação desta receita, e o equivalente da `url`
# do irmão síncrono e da `url_da_fila` do irmão de fila: é por ele que o teste
# do PR aciona o ambiente, com um `lambda invoke`, e é ele que o pipeline
# comenta no pull request. Sem trigger nascido aqui, este output não é
# conveniência: é o ÚNICO caminho de entrada que o preview tem.
output "funcao_arn" { value = module.funcao.funcao_arn }

# O nome, porque `aws lambda invoke` aceita nome e é o que se digita à mão
# quando alguém quer repetir na unha o que o pipeline fez.
output "nome_da_funcao" { value = module.funcao.nome_da_funcao }

# A role, para a célula que precisar acrescentar uma permissão que só aquele
# job usa (escrever num bucket, ler uma fila de outro domínio). Os dois irmãos
# não publicam isto porque neles a permissão extra sempre coube numa variável;
# aqui, "job" é o nome de tudo que não é porta nem fila, e a receita não tenta
# adivinhar o que cada um faz.
output "permissao_nome" { value = module.funcao.permissao_nome }
