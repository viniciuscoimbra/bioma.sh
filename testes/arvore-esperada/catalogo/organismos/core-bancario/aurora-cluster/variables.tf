variable "nome"     { type = string }
variable "ambiente" { type = string }

# o que o provider exige para cada recurso desta receita. Cada um é
# uma peça que se troca: valor vem de fora, nunca fixo na receita.

variable "rds_cluster_engine" {
  type        = string
  description = "engine de aws_rds_cluster (exigido pelo provider)"
}

variable "rds_cluster_instance_cluster_identifier" {
  type        = string
  description = "cluster_identifier de aws_rds_cluster_instance (exigido pelo provider)"
}

variable "rds_cluster_instance_engine" {
  type        = string
  description = "engine de aws_rds_cluster_instance (exigido pelo provider)"
}

variable "rds_cluster_instance_instance_class" {
  type        = string
  description = "instance_class de aws_rds_cluster_instance (exigido pelo provider)"
}

variable "db_subnet_group_subnet_ids" {
  type        = list(string)
  description = "subnet_ids de aws_db_subnet_group (exigido pelo provider)"
}

