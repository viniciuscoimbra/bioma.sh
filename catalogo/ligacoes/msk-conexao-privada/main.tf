# Ligação msk-conexao-privada (01.1 §6): a conexão multi-VPC NASCE na conta
# consumidora (client-managed), apontando o cluster do barramento. Premissas
# do outro lado: Provisioned, Kafka >= 2.7.1, multi-VPC habilitado depois do
# ACTIVE, mesma região, AZ IDs compatíveis, cluster policy publicada.

resource "aws_msk_vpc_connection" "esta" {
  target_cluster_arn = var.cluster_arn
  authentication     = "SASL_IAM"
  vpc_id             = var.vpc_id
  client_subnets     = var.subnet_ids
  security_groups    = var.security_group_ids
}
