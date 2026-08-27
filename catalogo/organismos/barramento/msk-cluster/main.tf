# Organismo msk-cluster (01, 01.1 §6): PREMISSA de produto: Provisioned, Kafka
# ≥ 2.7.1, Serverless excluído (o caminho entre contas exige multi-VPC private
# connectivity, que só existe aqui). A conectividade multi-VPC se habilita com
# o cluster ACTIVE; a conexão de cada consumidor nasce na conta dele (ligação
# msk-conexao-privada) e a autorização tem dois lados (politica-msk-*).

resource "aws_msk_configuration" "esta" {
  name           = "${var.nome}-config"
  kafka_versions = [var.versao_kafka]

  server_properties = <<-PROPS
    auto.create.topics.enable=false
    default.replication.factor=3
    min.insync.replicas=2
  PROPS
}

resource "aws_msk_cluster" "este" {
  cluster_name           = var.nome
  kafka_version          = var.versao_kafka
  number_of_broker_nodes = var.brokers

  broker_node_group_info {
    instance_type   = var.tipo_broker
    client_subnets  = var.subnet_ids
    security_groups = var.security_group_ids

    storage_info {
      ebs_storage_info {
        volume_size = var.storage_gb
      }
    }

    connectivity_info {
      vpc_connectivity {
        client_authentication {
          sasl {
            iam = true # multi-VPC: liga DEPOIS do ACTIVE (update, não create)
          }
        }
      }
    }
  }

  client_authentication {
    sasl {
      iam = true # IAM auth: sem segredo de Kafka (01.1 §6)
    }
  }

  encryption_info {
    encryption_at_rest_kms_key_arn = var.kms_key_arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.esta.arn
    revision = aws_msk_configuration.esta.latest_revision
  }

  # O log do broker é a trilha do barramento, e ele nasce desligado na AWS.
  # Cluster sem ele não tem como provar quem produziu, quem consumiu e o que
  # falhou, e a trilha é o que a auditoria regulatória cobra primeiro. Vai para
  # grupo de log da própria conta, que é de onde a subscrição leva para a camada
  # raw do lake; mandar direto para S3 de outra conta faria a receita conhecer o
  # destino, que é decisão de quem opera dados.
  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = var.log_broker
        log_group = var.log_broker ? aws_cloudwatch_log_group.broker[0].name : null
      }
    }
  }

  # Métrica de dentro do broker (JMX e nó). Sem isto o que se enxerga é o que o
  # CloudWatch expõe de fora, e lag de consumidor por partição, que é o número
  # que diz se o barramento está aguentando, não aparece.
  open_monitoring {
    prometheus {
      jmx_exporter {
        enabled_in_broker = var.metrica_aberta
      }
      node_exporter {
        enabled_in_broker = var.metrica_aberta
      }
    }
  }

  lifecycle { prevent_destroy = true } # tópicos com retenção moram nele
}

resource "aws_cloudwatch_log_group" "broker" {
  count = var.log_broker ? 1 : 0

  name              = "/aws/msk/${var.nome}"
  retention_in_days = var.dias_de_log
  kms_key_id        = var.kms_key_arn
}

resource "aws_ssm_parameter" "cluster_arn" {
  name  = "/plataforma/barramento/${var.plano}/cluster-arn"
  type  = "String"
  tier  = "Advanced"
  value = aws_msk_cluster.este.arn
}

# O caminho dos CONECTORES gerenciados, distinto do caminho das aplicações. A
# aplicação de domínio entra pela conexão multi-VPC (portas 14xxx), que é a
# fronteira que o barramento oferece sem rota de rede. O serviço gerenciado de
# conectores recusa esse formato: CreateConnector valida que o bootstrap IAM
# esteja na 9098 ("IAM Access Control with an Amazon MSK cluster requires
# port 9098", medido em 2026-08-27), e o worker alcança o broker por rota de
# TGW. Esta regra abre SÓ a 9098, só para as origens declaradas: a lista de
# cargas da VPC continua não sabendo dos domínios.
resource "aws_vpc_security_group_ingress_rule" "conector" {
  for_each = toset(var.cidrs_conectores)

  security_group_id = var.security_group_ids[0]
  description       = "conector gerenciado de dominio (bootstrap IAM 9098)"
  from_port         = 9098
  to_port           = 9098
  ip_protocol       = "tcp"
  cidr_ipv4         = each.value
}
