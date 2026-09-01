# Organismo adapter-fonte-externa (06): o adaptador por bureau (molécula
# funcao-processadora + molécula segredo com a credencial). A fonte externa é
# fronteira; só a nossa ponta entra. Saída pra internet pela inspeção central.
#
# A porta síncrona (api-privada) é o que o CONTRATO.md já prometia e o main.tf
# não construía: quem alcança o adapter de dentro da rede do domínio, sem
# internet. Rotas e integrações são da aplicação (esteira), e aqui nasce SÓ a
# API, sem deployment e sem stage (a razão está mais abaixo, junto da porta).

locals {
  nome_segredo = "mesa-credito/${var.ambiente}/${var.fonte}"
}

module "adapter" {
  source = "../../../moleculas/funcao-processadora"

  nome               = "adapter-${var.fonte}-${var.ambiente}"
  imagem_inicial     = var.imagem_inicial
  timeout_s          = 30
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  kms_key_arn        = var.kms_key_arn

  # Aponta o NOME do segredo, nunca o valor: mesmo padrão de
  # organismos/core-banking/desembolso (Program.cs, AddAwsSecretsManager).
  variaveis_de_ambiente = {
    SecretsManager__SecretId = local.nome_segredo
  }
}

module "credencial" {
  source = "../../../moleculas/segredo"

  nome        = local.nome_segredo
  kms_key_arn = var.kms_key_arn
}

module "porta" {
  source = "../../../moleculas/api-privada"

  nome            = "adapter-${var.fonte}-${var.ambiente}"
  vpc_endpoint_id = var.vpc_endpoint_id
}

# A API nasce aqui e para aqui: sem deployment e sem stage, do mesmo jeito que
# dominio-base/borda-interna. Quem publica a ROTA publica o deployment e o stage
# junto, porque é ele quem sabe quando a rota muda e quando republicar.
#
# A tentação era outra, e custou um apply para aparecer: com deployment nesta
# receita, a AWS recusa `CreateDeployment` numa REST API sem método nenhum, e a
# recusa chega no FIM, com todo o resto de pé (medido em 2026-09-01: dez de onze
# recursos criados). O conserto que se oferece sozinho é acrescentar um método de
# mentira só para o deployment passar, e ele é um curativo: a receita passa a
# criar uma rota que ninguém pediu para sustentar um deployment que não é dela.
#
# Sem deployment, o problema não existe. Quem consome descobre a API pelo
# `api_id`, e o que vier depois é de quem publica a rota.

resource "aws_iam_role_policy" "le_credencial" {
  name = "le-credencial"
  role = module.adapter.permissao_nome

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
