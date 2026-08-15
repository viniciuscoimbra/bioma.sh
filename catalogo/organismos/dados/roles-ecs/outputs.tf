output "execution_role_arn" { value = aws_iam_role.execucao.arn }
output "task_role_arn" { value = aws_iam_role.tarefa.arn }

# A definição da tarefa aponta `awslogs-group` para este nome: é o grupo que
# nasce junto das roles, e o único que a execução escreve.
output "log_group_nome" { value = aws_cloudwatch_log_group.tarefa.name }
