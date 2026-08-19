# Organismo aurora-cluster: livro-razão do domínio
# Zona declarada no bloco: Beta · Folha Dois · VPC privada · uma por ambiente (dev, hml, prd)
# Tecido: permanente (guarda dado que só existe aqui. Se cair, não tem de onde trazer de volta)
resource "aws_rds_cluster" "aurora_cluster" {
  engine                       = var.rds_cluster_engine

  # tecido permanente: não cai por destroy
  lifecycle { prevent_destroy = true }
}

resource "aws_rds_cluster_instance" "aurora_cluster" {
  cluster_identifier           = aws_rds_cluster.aurora_cluster.id # ligado pelo bioma: mesma receita
  engine                       = var.rds_cluster_instance_engine
  instance_class               = var.rds_cluster_instance_instance_class
}

resource "aws_db_subnet_group" "aurora_cluster" {
  subnet_ids                   = var.db_subnet_group_subnet_ids
}
