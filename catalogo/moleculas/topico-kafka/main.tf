# Molécula topico-kafka (01.1 §1-§5): o tópico e o contrato dele, juntos.
# Acesso NÃO nasce aqui (ligações politica-msk-*). O provider kafka conecta no
# endereço do cluster (a casa é de outro time; quem cria o conteúdo é o dono
# do tópico, com permissão delegada). No teste local, o mesmo provider aponta
# o Kafka de contêiner.

resource "kafka_topic" "este" {
  name               = var.nome
  partitions         = var.particoes
  replication_factor = var.replicacao

  config = {
    "retention.ms"        = tostring(var.retencao_ms)
    "cleanup.policy"      = "delete"
    "min.insync.replicas" = tostring(var.min_isr)
  }
}

resource "aws_glue_schema" "contrato" {
  schema_name       = var.nome_schema # <org>-<dominio>-<agregado>-<evento>
  registry_arn      = var.registry_arn
  data_format       = "AVRO"
  compatibility     = "BACKWARD_ALL" # 01.1 §2: consumer que reprocessa lê todas as versões
  schema_definition = var.schema_avro
}
