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
  # Data API (execução SQL por HTTPS, com IAM e sem conexão de rede). Nasce
  # desligado: cada chamada é superfície nova, e liga quem tem por que ligar.
  # O caso que criou a variável: bootstrap de schema por operador antes de a
  # esteira de migração existir, com o console e o CLI como único caminho até
  # o banco de uma VPC sem entrada. Ligado por fora do Terraform, o atributo
  # vira drift que o plano propõe desfazer em silêncio.
  enable_http_endpoint = var.data_api

  # Autenticação por IAM: quem chega ao banco chega com identidade da nuvem, e
  # não com senha guardada em algum lugar. A senha do mestre continua existindo
  # para o que só ela faz, mas deixa de ser o caminho normal.
  # Ligar isto NÃO vale no ato. O RDS guarda a mudança em PendingModifiedValues
  # e só a efetiva na janela de manutenção do cluster, que é diferente em cada um.
  # O apply diz "1 changed" e o describe-db-clusters continua respondendo false por
  # dias: quem medir a nuvem logo depois do apply conclui que falhou, e reaplica sem
  # necessidade. Para saber se está feito, pergunte por PendingModifiedValues, não
  # pelo valor corrente. Não pusemos apply_immediately porque ele vale para TODA
  # mudança futura deste cluster, inclusive as que reiniciam o banco: o preço de
  # antecipar esta seria pagar reinício não planejado em qualquer outra.
  iam_database_authentication_enabled = true

  # Sem exportar, o log do banco morre dentro dele: fica no disco da instância,
  # roda e some. O que se investiga depois de um incidente é justamente o que
  # aconteceu antes dele.
  enabled_cloudwatch_logs_exports = ["postgresql"]

  # A cópia herda a etiqueta do cluster. Sem isto, a cópia nasce sem dono, sem
  # ambiente e sem domínio — e cópia sem etiqueta é o que ninguém sabe se pode
  # apagar.
  copy_tags_to_snapshot = true

  # Porta fora da padrão. Não é segurança de verdade: é tirar o banco da
  # primeira varredura que qualquer um roda, que é a que encontra o que está no
  # lugar óbvio.
  port = var.porta

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

  # A métrica que o CloudWatch mostra por fora é a que a AWS enxerga do lado de
  # fora da instância. O monitoramento estendido lê de dentro do sistema
  # operacional, e é o que separa "o banco está lento" de "o disco está cheio".
  monitoring_interval = var.intervalo_monitoramento
  monitoring_role_arn = var.intervalo_monitoramento > 0 ? aws_iam_role.monitoramento[0].arn : null

  copy_tags_to_snapshot = true
}

# A role existe só quando o monitoramento estendido está ligado: role sem uso é
# identidade a mais para alguém assumir.
resource "aws_iam_role" "monitoramento" {
  count = var.intervalo_monitoramento > 0 ? 1 : 0

  name               = "${var.nome}-monitoramento"
  assume_role_policy = data.aws_iam_policy_document.monitoramento_confia.json
}

resource "aws_iam_role_policy_attachment" "monitoramento" {
  count = var.intervalo_monitoramento > 0 ? 1 : 0

  role       = aws_iam_role.monitoramento[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

data "aws_iam_policy_document" "monitoramento_confia" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["monitoring.rds.amazonaws.com"]
    }
  }
}
