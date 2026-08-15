# Organismo publicacao-ledger (01, 05): Debezium via MSK Connect lendo o WAL
# do livro e publicando no barramento (outbox; o schema do evento mora no
# registry). Plugin por artefato da esteira; conexão ao cluster de outra conta
# pela msk-conexao-privada desta conta.

resource "aws_mskconnect_custom_plugin" "debezium" {
  name         = "debezium-postgres-${var.ambiente}"
  content_type = "ZIP"

  location {
    s3 {
      bucket_arn = var.plugin_bucket_arn
      file_key   = var.plugin_s3_key
    }
  }
}

resource "aws_mskconnect_connector" "cdc" {
  name                       = "ledger-cdc-${var.ambiente}"
  kafkaconnect_version       = "2.7.1"
  service_execution_role_arn = var.role_conector_arn

  capacity {
    provisioned_capacity {
      worker_count = 1
      mcu_count    = 1
    }
  }

  connector_configuration = merge({
    "connector.class"    = "io.debezium.connector.postgresql.PostgresConnector"
    "plugin.name"        = "pgoutput"
    "table.include.list" = var.tabelas_outbox
  }, var.config_extra)

  kafka_cluster {
    apache_kafka_cluster {
      bootstrap_servers = var.bootstrap_servers
      vpc {
        subnets         = var.subnet_ids
        security_groups = var.security_group_ids
      }
    }
  }

  kafka_cluster_client_authentication {
    authentication_type = "IAM"
  }

  kafka_cluster_encryption_in_transit {
    encryption_type = "TLS"
  }

  plugin {
    custom_plugin {
      arn      = aws_mskconnect_custom_plugin.debezium.arn
      revision = aws_mskconnect_custom_plugin.debezium.latest_revision
    }
  }
}
