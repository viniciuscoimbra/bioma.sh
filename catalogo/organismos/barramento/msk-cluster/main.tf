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
  number_of_broker_nodes = 3 # um por AZ

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

  lifecycle { prevent_destroy = true } # tópicos com retenção moram nele
}

resource "aws_ssm_parameter" "cluster_arn" {
  name  = "/plataforma/barramento/${var.plano}/cluster-arn"
  type  = "String"
  tier  = "Advanced"
  value = aws_msk_cluster.este.arn
}
