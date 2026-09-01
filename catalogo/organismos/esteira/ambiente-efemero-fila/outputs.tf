# A URL da fila é o sítio de ligação desta receita, e o equivalente da `url` do
# irmão síncrono: é por ela que o teste do PR entrega a mensagem, e é ela que o
# pipeline comenta no pull request. O resto do que a receita cria morre com o
# PR e não é consumido por ninguém de fora.
output "url_da_fila" { value = aws_sqs_queue.entrada.url }

output "fila_arn" { value = aws_sqs_queue.entrada.arn }

# A de descarte é onde o defeito aparece: quem lê o resultado do preview olha
# aqui antes de olhar o log.
output "url_da_fila_de_descarte" { value = aws_sqs_queue.descarte.url }

output "nome_da_funcao" { value = module.funcao.nome_da_funcao }
