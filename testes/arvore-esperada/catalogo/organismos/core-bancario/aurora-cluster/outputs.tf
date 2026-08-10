# O que esta célula publica para as vizinhas. É daqui que sai o valor
# que a dependência delas consome; endereço que cruza dono vira
# hormônio (aws_ssm_parameter), e não output.
output "id" { value = aws_rds_cluster.aurora_cluster.id }
output "arn" { value = aws_rds_cluster.aurora_cluster.arn }
output "rds_cluster_instance_id" { value = aws_rds_cluster_instance.aurora_cluster.id }
output "rds_cluster_instance_arn" { value = aws_rds_cluster_instance.aurora_cluster.arn }
output "db_subnet_group_id" { value = aws_db_subnet_group.aurora_cluster.id }
output "db_subnet_group_arn" { value = aws_db_subnet_group.aurora_cluster.arn }
