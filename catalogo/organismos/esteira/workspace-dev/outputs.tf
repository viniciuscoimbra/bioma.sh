output "instance_id" { value = aws_instance.workspace.id }

# Quem precisa deixar esta máquina falar com um serviço fechado casa pelo
# grupo, e não pelo endereço: endereço muda quando a máquina é recriada.
output "security_group_id" { value = aws_security_group.sem_entrada.id }
