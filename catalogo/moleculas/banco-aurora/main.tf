# Molécula banco-aurora: o store que guarda o que não se perde. Schema e
# tabelas são da esteira de migração (corpo e comportamento). pg_audit por
# parameter group; deletion_protection sempre; a chave vem do domínio.

resource "aws_rds_cluster_parameter_group" "auditoria" {
  name   = "${var.nome}-pgaudit"
  family = var.familia

  parameter {
    name         = "shared_preload_libraries"
    value        = "pgaudit"
    apply_method = "pending-reboot"
  }

  parameter {
    name  = "pgaudit.log"
    value = var.pgaudit_log
  }
}

resource "aws_db_subnet_group" "este" {
  name       = var.nome
  subnet_ids = var.subnet_ids
}

resource "aws_rds_cluster" "este" {
  cluster_identifier              = var.nome
  engine                          = "aurora-postgresql"
  engine_version                  = var.versao_engine
  database_name                   = var.nome_banco
  master_username                 = var.usuario_mestre
  manage_master_user_password     = true # o valor nunca na receita; Secrets Manager gerencia
  db_subnet_group_name            = aws_db_subnet_group.este.name
  vpc_security_group_ids          = var.security_group_ids
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.auditoria.name
  kms_key_id                      = var.kms_key_arn
  storage_encrypted               = true
  deletion_protection             = true
  backup_retention_period         = var.retencao_backup_dias
  final_snapshot_identifier       = "${var.nome}-final"

  lifecycle { prevent_destroy = true }
}

resource "aws_rds_cluster_instance" "instancia" {
  count = var.instancias

  identifier                   = "${var.nome}-${count.index}"
  cluster_identifier           = aws_rds_cluster.este.id
  engine                       = aws_rds_cluster.este.engine
  engine_version               = aws_rds_cluster.este.engine_version
  instance_class               = var.classe
  performance_insights_enabled = true
}
