# Organismo consumo-saga (01, 05): o consumer (molécula funcao-processadora)
# com mapeamento de origem no cluster de outra conta e a saga em Step
# Functions. O ESM entre contas exige a conexão privada desta conta e
# kafka:DescribeVpcConnection na role (ligação politica-msk-consumidor).

module "consumer" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "saga-consumer-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn
}

# ABERTO, e só um apply real decide. `event_source_arn` recebe o ARN do
# CLUSTER. Quando o cluster mora em OUTRA conta, o CONTRATO da ligação
# `msk-conexao-privada` diz que o Event Source Mapping aponta o ARN da CONEXÃO,
# e não o do cluster: a conexão multi-VPC é o que dá ao Lambda um caminho até
# um cluster que não é da conta dele.
# Se o contrato estiver certo, este ESM é recusado no apply e a linha abaixo
# passa a ler o output daquela ligação. O TESTE QUE DECIDE é o primeiro apply
# deste organismo contra cluster de outra conta: `ResourceNotFoundException` ou
# `InvalidParameterValueException` no ESM confirma o contrato; um ESM que nasce
# e fica `Enabled` diz que o ARN do cluster basta, e aí é o contrato que se
# corrige. Enquanto ninguém aplicou, os dois lados são plausíveis e nenhum é
# suposição escrita como fato.
resource "aws_lambda_event_source_mapping" "do_barramento" {
  function_name     = module.consumer.nome_da_funcao
  event_source_arn  = var.cluster_arn
  topics            = var.topicos
  starting_position = "TRIM_HORIZON"

  amazon_managed_kafka_event_source_config {
    consumer_group_id = "saga-${var.ambiente}"
  }
}

resource "aws_iam_role" "saga" {
  name = "saga-maquina-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "states.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "saga_invoca" {
  name = "invoca-passos"
  role = aws_iam_role.saga.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = var.funcoes_passos_arns
    }]
  })
}

resource "aws_sfn_state_machine" "saga" {
  name       = "saga-transacional-${var.ambiente}"
  role_arn   = aws_iam_role.saga.arn
  definition = var.definicao_asl # a definição é da aplicação; chega por artefato
  type       = "STANDARD"
}
