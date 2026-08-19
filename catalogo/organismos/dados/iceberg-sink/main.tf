# Organismo iceberg-sink (01, 04): MSK Connect levando tópicos ao lake em
# Iceberg. O plugin (zip do connector) chega por artefato da esteira no S3;
# a receita referencia, nunca embute. Consome o cluster por conexão privada
# (a ligação msk-conexao-privada desta conta) quando o barramento é de outra.
#
# O conector precisa saber ONDE escrever (catálogo Glue e warehouse no bronze),
# EM QUE tabela (uma por tópico, ou roteada por campo quando há vários) e COMO
# ler o evento (AVRO do Glue Schema Registry). Sem essas três coisas o conector
# sobe RUNNING e não escreve um byte, e nada no apply diz isso. Por isso elas
# são input com validação, e não `config_extra` opcional.

locals {
  nome = "iceberg-sink-${var.nome_curto}-${var.plano}"

  # O tópico público da referência é `<dominio>.pub.<agregado>-<recorte>.vN`;
  # a tabela no lake é `<agregado>_<recorte>_vN`, no database do domínio. Uma
  # regra só governa tópico e landing: tira-se o prefixo do domínio e troca-se
  # `.` e `-` por `_`, que é o que o Glue aceita em nome de tabela.
  tabela_de = { for t in var.topicos :
    t => "${var.database_destino}.${replace(replace(replace(t, "/^[^.]+\\.pub\\./", ""), ".", "_"), "-", "_")}"
  }

  configuracao_base = {
    "connector.class" = "org.apache.iceberg.connect.IcebergSinkConnector"
    "tasks.max"       = tostring(var.tasks_max)
    "topics"          = join(",", var.topicos)

    # evento que não desserializa para o conector, e o log diz qual: aterrissar
    # lixo calado no bronze imutável é pior que parar. Tolerância entra por
    # `config_extra` quando houver quem consuma o DLT do sink.
    "errors.tolerance"            = "none"
    "errors.log.enable"           = "true"
    "errors.log.include.messages" = "false"

    # o catálogo é o Glue Data Catalog desta conta, e o warehouse é o bronze
    "iceberg.catalog.catalog-impl"  = "org.apache.iceberg.aws.glue.GlueCatalog"
    "iceberg.catalog.io-impl"       = "org.apache.iceberg.aws.s3.S3FileIO"
    "iceberg.catalog.warehouse"     = "s3://${var.warehouse_bucket_nome}/"
    "iceberg.catalog.client.region" = var.regiao

    # uma tabela por tópico; com mais de um tópico, o campo de rota decide
    "iceberg.tables"                       = join(",", values(local.tabela_de))
    "iceberg.tables.auto-create-enabled"   = "true"
    "iceberg.tables.evolve-schema-enabled" = tostring(var.evoluir_schema)
    "iceberg.tables.upsert-mode-enabled"   = "false"

    # partição pela data do EVENTO, não da chegada: o campo vem do envelope do
    # contrato, e sem ele a tabela nasce sem partição e o Athena varre tudo
    "iceberg.tables.default-partition-by" = "day(${var.campo_data_evento})"

    # o tópico de controle coordena o commit entre workers; com
    # `auto.create.topics.enable=false` no cluster, ele nasce pela molécula
    # topico-kafka, e o nome bate com o que a célula do barramento declara
    "iceberg.control.topic"              = var.topico_controle
    "iceberg.control.commit.interval-ms" = tostring(var.intervalo_commit_ms)

    # o evento é AVRO com schema no Glue Schema Registry do barramento; a chave
    # é string. O converter mora no mesmo zip do plugin (a esteira o empacota).
    "key.converter"                                 = "org.apache.kafka.connect.storage.StringConverter"
    "value.converter"                               = "com.amazonaws.services.schemaregistry.kafkaconnect.AWSKafkaAvroConverter"
    "value.converter.region"                        = var.registry_regiao
    "value.converter.registry.name"                 = var.registry_nome
    "value.converter.avroRecordType"                = "GENERIC_RECORD"
    "value.converter.schemaAutoRegistrationEnabled" = "false"
  }

  configuracao_rota = var.campo_de_rota == "" ? {} : {
    "iceberg.tables.route-field" = var.campo_de_rota
  }
}

resource "aws_mskconnect_custom_plugin" "iceberg" {
  name         = local.nome
  content_type = "ZIP"

  location {
    s3 {
      bucket_arn = var.plugin_bucket_arn
      file_key   = var.plugin_s3_key
    }
  }
}

resource "aws_cloudwatch_log_group" "conector" {
  name              = "/msk-connect/${local.nome}"
  retention_in_days = var.retencao_log_dias
}

# Um conector por tópico público (04: MSK Connect ×tópico): o nome carrega o
# tópico, e o grupo de consumo que o MSK Connect fixa (`connect-<nome>`) também.
resource "aws_mskconnect_connector" "sink" {
  name                       = local.nome
  kafkaconnect_version       = "2.7.1"
  service_execution_role_arn = var.role_conector_arn

  capacity {
    autoscaling {
      min_worker_count = 1
      max_worker_count = var.max_workers
      mcu_count        = 1
    }
  }

  connector_configuration = merge(local.configuracao_base, local.configuracao_rota, var.config_extra)

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

  # o log do conector é o único lugar onde "RUNNING e não escreve" aparece
  log_delivery {
    worker_log_delivery {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.conector.name
      }
    }
  }
}
