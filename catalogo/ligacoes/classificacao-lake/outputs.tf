# O que foi classificado, para quem vem depois: o acesso-lake depende desta
# ligação pela ORDEM (grant por tag sobre expressão que nada casa concede nada,
# sem erro), e dependência de Terragrunt sem output nenhum reprova o apply de
# quem depende. O output é a lista do que a classificação alcançou, que também
# é o que a matriz de contratos de dado confere no cenário D5.
output "bancos_classificados" { value = keys(var.bancos) }
output "tabelas_classificadas" { value = keys(var.tabelas) }
