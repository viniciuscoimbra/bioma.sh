# Organismo consumo-decisao (06): consome pedidos de decisão do barramento
# (ESM na conexão privada desta conta) e aciona o motor. Mesmo padrão do
# consumo-saga do core.

locals {
  nome_segredo = "mesa-credito/${var.ambiente}/consumo-decisao"
}

module "consumer" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "decisao-consumer-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn

  # Aponta o NOME do segredo, nunca o valor: mesmo padrão de
  # organismos/mesa-credito/adapter-fonte-externa e core-banking/desembolso.
  variaveis_de_ambiente = {
    SecretsManager__SecretId = local.nome_segredo
  }
}

module "credencial" {
  source = "../../../moleculas/segredo"

  nome        = local.nome_segredo
  kms_key_arn = var.kms_key_arn
}

resource "aws_iam_role_policy" "le_credencial" {
  name = "le-credencial"
  role = module.consumer.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = module.credencial.arn
      },
      {
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.kms_key_arn
      }
    ]
  })
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
    consumer_group_id = "mesa-decisao-${var.ambiente}"
  }
}

resource "aws_iam_role_policy" "aciona_motor" {
  name = "aciona-motor"
  role = module.consumer.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "states:StartSyncExecution"
      Resource = var.motor_arn
    }]
  })
}
