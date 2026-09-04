output "endpoint" { value = aws_rds_cluster.este.endpoint }
output "reader_endpoint" { value = aws_rds_cluster.este.reader_endpoint }
output "cluster_arn" { value = aws_rds_cluster.este.arn }

# O segredo que o próprio RDS gerencia (`manage_master_user_password`), para
# quem precisa LER a credencial em tempo de execução em vez de recebê-la. O
# Debezium é o caso: o config provider do plugin resolve
# `${secretsmanager:<nome>:username}` no start do conector, e o valor nunca
# passa pela receita nem fica gravado na configuração.
output "segredo_arn" {
  value = one(aws_rds_cluster.este.master_user_secret[*].secret_arn)
}

# O NOME, que é como o config provider referencia o segredo. Sai do ARN, porque
# o RDS não publica o nome à parte: o formato é
# `arn:aws:secretsmanager:<regiao>:<conta>:secret:<nome>-<sufixo>`, e o nome
# real inclui o `rds!cluster-...` inteiro, sem o sufixo de seis caracteres que
# a AWS acrescenta.
output "segredo_nome" {
  value = one([
    for arn in aws_rds_cluster.este.master_user_secret[*].secret_arn :
    join("-", slice(split("-", split(":secret:", arn)[1]), 0, length(split("-", split(":secret:", arn)[1])) - 1))
  ])
}
