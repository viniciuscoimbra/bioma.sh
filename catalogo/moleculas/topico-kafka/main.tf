# Molécula topico-kafka (01.1 §1-§5): o tópico e o contrato dele, juntos.
# Acesso NÃO nasce aqui (ligações politica-msk-*). O provider kafka conecta no
# endereço do cluster (a casa é de outro time; quem cria o conteúdo é o dono
# do tópico, com permissão delegada). No teste local, o mesmo provider aponta
# o Kafka de contêiner.
#
# Nome do tópico: só `.` e `-`, nunca `_`. O Kafka aceita os três, mas `a.b` e
# `a_b` colidem no nome da métrica, e o Kafka avisa na criação. Por isso a
# referência usa ponto como separador de nível e hífen dentro do nível
# (`<dominio>.<agregado>` interno, `<dominio>.pub.<agregado>-<recorte>.vN`
# público), e deixa o underscore para a tabela do lake, que é outro namespace.
#
# Tópico de controle ou interno de infraestrutura não tem contrato Avro: sem
# `schema_avro`, só o tópico nasce. Tópico público sempre tem.

resource "kafka_topic" "este" {
  name               = var.nome
  partitions         = var.particoes
  replication_factor = var.replicacao

  config = merge({
    "retention.ms"        = tostring(var.retencao_ms)
    "cleanup.policy"      = "delete"
    "min.insync.replicas" = tostring(var.min_isr)
  }, var.config_extra)
}

resource "aws_glue_schema" "contrato" {
  count = var.schema_avro == "" ? 0 : 1

  schema_name       = var.nome_schema # <org>-<dominio>-<agregado>-<evento>
  registry_arn      = var.registry_arn
  data_format       = "AVRO"
  compatibility     = "BACKWARD_ALL" # 01.1 §2: consumer que reprocessa lê todas as versões
  schema_definition = var.schema_avro
}
