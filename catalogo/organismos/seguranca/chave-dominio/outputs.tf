# O ARN que QUEM CONSOME deve usar, e ele nem sempre é o da primária.
#
# Chave multi-região tem um ARN por região, e recurso só cifra com o ARN da
# região dele: um bucket em Virgínia com o ARN de São Paulo é recusado pela AWS.
# Quando a carga que usa esta chave vive noutra região (a não-produção, depois
# de 2026-09-04), `key_arn` passa a devolver a réplica, e as dezenas de células
# que leem este output não mudam uma linha.
#
# A primária continua sendo quem governa a chave: rotação, política e exclusão
# são atos dela, e por isso a célula que a cria fica na região dela. Isto aqui
# resolve só o USO.
output "key_arn" {
  value = var.regiao_de_consumo == "" ? aws_kms_key.primaria.arn : aws_kms_replica_key.replica.arn
}

# A primária, sempre, para quem precisa dela de propósito (política, rotação).
output "key_arn_primaria" { value = aws_kms_key.primaria.arn }
output "replica_arn" { value = aws_kms_replica_key.replica.arn }
output "parameter_arn" { value = aws_ssm_parameter.arn.arn }
