# Organismo ingestao-core (05): DMS trazendo o core vendor (fronteira) para o
# lado de cá. Endpoint de origem aponta o endereço do vendor (chega pela
# conectividade física, fronteira); a credencial vem de segredo, nunca daqui.

resource "aws_dms_replication_subnet_group" "este" {
  replication_subnet_group_id          = "ingestao-core-${var.ambiente}"
  replication_subnet_group_description = "ingestao do core vendor"
  subnet_ids                           = var.subnet_ids
}

resource "aws_dms_replication_instance" "esta" {
  replication_instance_id     = "ingestao-core-${var.ambiente}"
  replication_instance_class  = var.classe
  allocated_storage           = 100
  kms_key_arn                 = var.kms_key_arn
  publicly_accessible         = false
  multi_az                    = var.multi_az
  replication_subnet_group_id = aws_dms_replication_subnet_group.este.id
  vpc_security_group_ids      = var.security_group_ids
}

resource "aws_dms_endpoint" "origem" {
  endpoint_id                     = "core-vendor-${var.ambiente}"
  endpoint_type                   = "source"
  engine_name                     = var.engine_origem
  secrets_manager_arn             = var.segredo_origem_arn
  secrets_manager_access_role_arn = var.role_segredo_arn
}

resource "aws_dms_endpoint" "destino" {
  endpoint_id                     = "ledger-${var.ambiente}"
  endpoint_type                   = "target"
  engine_name                     = "aurora-postgresql"
  secrets_manager_arn             = var.segredo_destino_arn
  secrets_manager_access_role_arn = var.role_segredo_arn
}

resource "aws_dms_replication_task" "carga" {
  replication_task_id      = "carga-core-${var.ambiente}"
  replication_instance_arn = aws_dms_replication_instance.esta.replication_instance_arn
  source_endpoint_arn      = aws_dms_endpoint.origem.endpoint_arn
  target_endpoint_arn      = aws_dms_endpoint.destino.endpoint_arn
  migration_type           = "full-load-and-cdc"
  table_mappings           = var.mapeamento_tabelas

  lifecycle {
    ignore_changes = [replication_task_settings] # o console ajusta em operação
  }
}
