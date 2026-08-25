# Organismo acesso-de-emergencia (03·D2): a via explícita para agir em produção
# quando a via rotineira não basta.
#
# A decisão que ele serve manda produção ter leitura mais operação auditada, com
# administração entrando por um caminho de emergência declarado. Sem esse
# caminho construído, a única saída honesta é deixar administração permanente
# ligada, e foi o que aconteceu: dez pessoas com administração o tempo todo em
# contas de produção, porque tirar sem ter para onde ir seria pior.
#
# O QUE ESTE ORGANISMO NÃO TEM, DE PROPÓSITO: como pôr alguém no grupo. A
# receita cria o grupo VAZIO e não conhece membro nenhum. Entrar é ato humano,
# feito na hora, por quem administra o diretório, e fica no CloudTrail com nome
# e horário. Se a receita soubesse preencher, um apply distraído concederia
# emergência permanente e ninguém veria: a emergência viraria o estado normal,
# que é exatamente o que ela existe para desfazer.
#
# O QUE ELE AINDA NÃO FAZ: expirar sozinho. A sessão é curta e limita quanto
# tempo cada entrada dura, mas quem ficou no grupo entra de novo. Enquanto a
# retirada for ato humano, o aviso é o que a torna cobrável; a expiração
# automática é trabalho declarado, não promessa deste código.

data "aws_region" "atual" {}

data "aws_ssoadmin_instances" "esta" {
  lifecycle {
    postcondition {
      condition     = length(self.arns) > 0
      error_message = "O IAM Identity Center não responde em ${data.aws_region.atual.region}. Ele vive numa região só, e o provider desta célula precisa estar nela."
    }
  }
}

locals {
  instance_arn      = tolist(data.aws_ssoadmin_instances.esta.arns)[0]
  identity_store_id = tolist(data.aws_ssoadmin_instances.esta.identity_store_ids)[0]
}

# A sessão curta é o prazo máximo da Decisão 2. Ela não impede voltar a entrar;
# o que ela garante é que ninguém fica com console aberto de ontem.
resource "aws_ssoadmin_permission_set" "emergencia" {
  name             = var.nome
  instance_arn     = local.instance_arn
  session_duration = var.duracao_sessao
  description      = "acesso de emergência: entra por ato explícito, sai quando o grupo é esvaziado, e toda entrada avisa"
}

resource "aws_ssoadmin_managed_policy_attachment" "poder" {
  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.emergencia.arn
  managed_policy_arn = var.politica_gerenciada
}

# Nasce e permanece vazio. Ver a nota no topo: não existe recurso de membro aqui.
resource "aws_identitystore_group" "emergencia" {
  identity_store_id = local.identity_store_id
  display_name      = var.nome
  description       = "acesso de emergência; entrar é ato humano registrado, e o grupo fica vazio fora da emergência"
}

resource "aws_ssoadmin_account_assignment" "onde" {
  for_each = toset(var.contas)

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.emergencia.arn
  principal_type     = "GROUP"
  principal_id       = aws_identitystore_group.emergencia.group_id
  target_type        = "AWS_ACCOUNT"
  target_id          = each.key
}

# O aviso. Sem ele a via de emergência é uma porta destrancada sem campainha, e
# a Decisão 6 pede que concessão e revogação sejam vistas como movimentação de
# dinheiro.
# A chave do aviso, quando a instância não trouxe uma. Ver a nota em
# variables.tf: a gerenciada da AWS não aceita liberar o EventBridge, e é por
# isso que existe chave aqui em vez de simplesmente cifrar com a do serviço.
resource "aws_kms_key" "aviso" {
  count = var.kms_key_arn == null ? 1 : 0

  description         = "cifra o aviso de mudança de acesso humano"
  enable_key_rotation = true

  # Chave apagada leva junto o que ela cifrou, e aqui isso é a trilha de quem
  # entrou na emergência. A destruição fica barrada no plano: para trocar de
  # chave, migra-se o tópico primeiro e o bloqueio sai por mudança declarada.
  lifecycle {
    prevent_destroy = true
  }

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "ContaAdministra"
        Effect    = "Allow"
        Principal = { AWS = "arn:${data.aws_partition.esta.partition}:iam::${data.aws_caller_identity.esta.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        # Sem isto o EventBridge é aceito como alvo e falha na entrega, em
        # silêncio: a regra casa, a publicação é negada, e o aviso nunca chega.
        Sid       = "EventBridgePublica"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = ["kms:GenerateDataKey*", "kms:Decrypt"]
        Resource  = "*"
      },
    ]
  })
}

resource "aws_kms_alias" "aviso" {
  count = var.kms_key_arn == null ? 1 : 0

  name          = "alias/${var.nome}-avisos"
  target_key_id = aws_kms_key.aviso[0].key_id
}

module "aviso" {
  source = "../../../moleculas/topico-sns"

  nome         = "${var.nome}-avisos"
  nome_exibido = "acesso emergencial"
  kms_key_arn  = var.kms_key_arn != null ? var.kms_key_arn : aws_kms_key.aviso[0].arn

  assinaturas = [
    for e in var.destinos_aviso : { protocolo = "email", destino = e }
  ]

  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "events.amazonaws.com" }
      Action    = "SNS:Publish"
      Resource  = "arn:${data.aws_partition.esta.partition}:sns:${data.aws_region.atual.region}:${data.aws_caller_identity.esta.account_id}:${var.nome}-avisos"
    }]
  })
}

data "aws_partition" "esta" {}
data "aws_caller_identity" "esta" {}

# Os nomes de evento saem de medição no CloudTrail desta organização, e não de
# memória: o diretório do Identity Center registra `CreateGroupMembership` em
# `identitystore.amazonaws.com`, e a atribuição registra `CreateAccountAssignment`
# em `sso.amazonaws.com`. Errar o nome aqui não dá erro em lugar nenhum: a regra
# nasce, nunca casa, e a porta fica sem campainha parecendo ter uma.
#
# A regra vigia o diretório INTEIRO, e não só este grupo: o filtro por grupo
# exigiria o identificador dentro do padrão, e mudança de acesso em qualquer
# grupo é exatamente o que a Decisão 6 quer ver. Ruído de apply da esteira é
# aceitável; mudança de acesso que ninguém vê, não.
resource "aws_cloudwatch_event_rule" "mudanca_de_acesso" {
  name        = "${var.nome}-mudanca-de-acesso"
  description = "toda concessão ou revogação de acesso humano na organização"

  event_pattern = jsonencode({
    "detail-type" = ["AWS API Call via CloudTrail"]
    detail = {
      eventSource = ["identitystore.amazonaws.com", "sso.amazonaws.com"]
      eventName = [
        "CreateGroupMembership", "DeleteGroupMembership",
        "CreateAccountAssignment", "DeleteAccountAssignment",
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "avisa" {
  rule      = aws_cloudwatch_event_rule.mudanca_de_acesso.name
  target_id = "sns"
  arn       = module.aviso.arn
}
