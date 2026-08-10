# Organismo iceberg-sink (01, 04): MSK Connect levando tópicos ao lake em
# Iceberg. O plugin (zip do connector) chega por artefato da esteira no S3;
# a receita referencia, nunca embute. Consome o cluster por conexão privada
# (a ligação msk-conexao-privada desta conta) quando o barramento é de outra.

resource "aws_mskconnect_custom_plugin" "iceberg" {
  name         = "iceberg-sink-${var.plano}"
  content_type = "ZIP"

  location {
    s3 {
      bucket_arn = var.plugin_bucket_arn
      file_key   = var.plugin_s3_key
    }
  }
}

resource "aws_mskconnect_connector" "sink" {
  name                       = "iceberg-sink-${var.plano}"
  kafkaconnect_version       = "2.7.1"
  service_execution_role_arn = var.role_conector_arn

  capacity {
    autoscaling {
      min_worker_count = 1
      max_worker_count = var.max_workers
      mcu_count        = 1
    }
  }

  connector_configuration = merge({
    "connector.class" = "org.apache.iceberg.connect.IcebergSinkConnector"
    "topics"          = join(",", var.topicos)
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
      arn      = aws_mskconnect_custom_plugin.iceberg.arn
      revision = aws_mskconnect_custom_plugin.iceberg.latest_revision
    }
  }
}
