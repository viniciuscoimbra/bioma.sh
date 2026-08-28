# Organismo landing-zone (00 · guia §3 camada 2): a landing zone do Control
# Tower, na conta de management.
#
# A escolha do interior estava pendente entre dois módulos vendor, e a
# comparação de 2026-08-10 resolveu pelos dois lados de fora:
#
#   Gruntwork terraform-aws-control-tower  cria a landing zone, mas o
#     repositório é privado e o acesso exige assinatura. A fundação de uma
#     instituição regulada passaria a depender de contrato comercial para
#     existir em código, que é a mesma dependência de fornecedor que este
#     desenho recusa em toda parte.
#
#   schubergphilis mcaf-landing-zone  é Apache 2.0 e ativo (mudou de endereço
#     em julho de 2026), mas não cria a landing zone: ele exige que o Control
#     Tower já esteja implantado e cuida do que vem depois. Não responde a esta
#     receita; responde à seguinte.
#
# Sobra o recurso do provider, e o motivo que o rejeitava caducou: a versão em
# uso expõe `remediation_types`, que é o que a sequência inteira precisa e cuja
# ausência era metade da recusa. A outra metade era o diff perpétuo no
# manifesto, e aqui ele é tratado à vista: o manifesto nasce de variáveis, num
# JSON canônico, e `drift_status` sai como saída. Divergência aparece; ela não
# é silenciada por `ignore_changes`, porque manifesto que muda sozinho na
# fundação é o primeiro sintoma de mudança feita pelo console.

# A OU de segurança nasce aqui, e não na árvore de OUs (célula 02), por
# imposição da versão 4.0: o Control Tower deixou de criar a Security OU, e as
# contas de integração de serviço têm de estar todas na mesma OU imediatamente
# abaixo da raiz (key-changes-lz-v4 e lz-api-launch, "Service integration
# accounts must be in the same OU directly under root"). Quem cria a OU é quem
# cria as contas que moram nela, no mesmo state, senão a landing zone depende
# de uma célula que roda depois dela. O id sai como saída para a árvore de OUs
# adotar esta OU em vez de declarar outra com o mesmo nome.
resource "aws_organizations_organizational_unit" "seguranca" {
  name      = "Security"
  parent_id = var.root_id

  lifecycle {
    prevent_destroy = true
  }
}

# As duas contas centrais nascem antes da landing zone porque o manifesto pede o
# número delas: a API 4.0 recebe accountId de conta que já existe, não cria
# conta nenhuma. Elas são da Organization, e não do Control Tower: quem as cria
# aqui é quem as governa depois. `role_name` é o que o Control Tower assume para
# inscrever a conta, e por isso fica no valor padrão.
resource "aws_organizations_account" "audit" {
  name      = "audit"
  email     = var.email_audit
  parent_id = aws_organizations_organizational_unit.seguranca.id
  role_name = "OrganizationAccountAccessRole"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [role_name]
  }
}

resource "aws_organizations_account" "log_archive" {
  name      = "log-archive"
  email     = var.email_log_archive
  parent_id = aws_organizations_organizational_unit.seguranca.id
  role_name = "OrganizationAccountAccessRole"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [role_name]
  }
}

# As três roles de serviço que o Control Tower assume para montar a landing
# zone. Quem cria a landing zone pelo console recebe as três de graça, e quem a
# cria pela API precisa tê-las antes: é o passo 3 de
# https://docs.aws.amazon.com/controltower/latest/userguide/lz-api-prereques.html
# Sem elas, o `CreateLandingZone` responde ValidationException dizendo que não
# conseguiu assumir a AWSControlTowerAdmin, e o erro não diz que falta criar
# coisa alguma.
#
# O `path` é `/service-role/`, e não o padrão: a doc cria com
# `--path /service-role/`, e o Control Tower procura a role nesse caminho. Nome
# certo no caminho errado dá o mesmo erro, um apply depois.
#
# A quarta role do prereq, AWSControlTowerConfigAggregatorRoleForOrganizations,
# não entra: roles-how#config-role-for-organizations diz que a landing zone 4.0
# não precisa dela, porque a AWS migrou o agregador de Config para o
# service-linked. Role de IAM órfã na management é o que ninguém apaga depois.
data "aws_iam_policy_document" "confia" {
  for_each = {
    admin      = "controltower.amazonaws.com"
    stackset   = "cloudformation.amazonaws.com"
    cloudtrail = "cloudtrail.amazonaws.com"
  }

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = [each.value]
    }
  }
}

resource "aws_iam_role" "controltower_admin" {
  name               = "AWSControlTowerAdmin"
  path               = "/service-role/"
  assume_role_policy = data.aws_iam_policy_document.confia["admin"].json
}

# A inline que a doc chama de AWSControlTowerAdminPolicy. A zona de
# disponibilidade é o que o Control Tower lê para escolher onde implanta.
resource "aws_iam_role_policy" "controltower_admin" {
  name = "AWSControlTowerAdminPolicy"
  role = aws_iam_role.controltower_admin.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "ec2:DescribeAvailabilityZones"
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "controltower_admin" {
  role       = aws_iam_role.controltower_admin.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSControlTowerServiceRolePolicy"
}

resource "aws_iam_role" "controltower_stackset" {
  name               = "AWSControlTowerStackSetRole"
  path               = "/service-role/"
  assume_role_policy = data.aws_iam_policy_document.confia["stackset"].json
}

# O CloudFormation assume esta role para implantar os stack sets nas contas, e
# de lá assume a AWSControlTowerExecution de cada uma. O `*` na conta é da
# própria doc: a role de execução nasce em toda conta que o Control Tower
# inscreve, e a lista não existe no momento em que a policy é escrita.
resource "aws_iam_role_policy" "controltower_stackset" {
  name = "AWSControlTowerStackSetRolePolicy"
  role = aws_iam_role.controltower_stackset.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sts:AssumeRole"]
      Resource = ["arn:aws:iam::*:role/AWSControlTowerExecution"]
    }]
  })
}

resource "aws_iam_role" "controltower_cloudtrail" {
  name               = "AWSControlTowerCloudTrailRole"
  path               = "/service-role/"
  assume_role_policy = data.aws_iam_policy_document.confia["cloudtrail"].json
}

# Managed, e não inline: a doc marca a inline de logs como "previous", e a
# managed existe para a AWS atualizar a permissão sem passar por quem instalou.
resource "aws_iam_role_policy_attachment" "controltower_cloudtrail" {
  role       = aws_iam_role.controltower_cloudtrail.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSControlTowerCloudTrailRolePolicy"
}

# O manifesto segue o schema publicado da versão 4.0
# (https://docs.aws.amazon.com/controltower/latest/userguide/landing-zone-schemas.html,
# seção "Landing zone 4.0 schema"), que traz `additionalProperties: false` no
# topo: chave fora da lista faz a API recusar o documento inteiro. As seis
# chaves aceitas são accessManagement, backup, centralizedLogging,
# governedRegions, securityRoles e config. `organizationStructure` saiu no 4.0 e
# por isso não aparece aqui.
#
# As cinco integrações carregam `enabled` obrigatório: o schema marca
# `required: ["enabled"]` em cada definição, e lz-api-launch é explícito ("All
# enabled flags are required in the manifest... No default values are
# provided"). Onde o schema permite omitir o bloco e a página de lançamento
# manda declarar, a forma que satisfaz as duas é declarar com booleano à vista.
#
# A cadeia de dependência entre as integrações (key-changes-lz-v4) fecha por
# baixo: accessManagement (Identity Center) exige securityRoles, que exige
# config. Desligar config obrigaria a desligar as três, e a régua do BACEN não
# aceita fundação sem gravação de configuração.
# A trilha e o agregador que o Control Tower cria nascem sem cifra em repouso, e
# não há como cifrá-los por fora: quem manda neles é este manifesto. A chave
# entra por aqui, e o schema 4.0 a aceita em `centralizedLogging.configurations`
# e em `config.configurations` (definição `LoggingConfigurations`).
#
# A política é a que os dois serviços exigem para escrever cifrado. Sem a
# condição de `EncryptionContext`, qualquer trilha de qualquer conta poderia
# pedir chave a esta — a condição amarra o uso à organização.
resource "aws_kms_key" "registro_central" {
  description             = "cifra a trilha e o agregador do Control Tower"
  enable_key_rotation     = true
  deletion_window_in_days = 30

  policy = data.aws_iam_policy_document.registro_central.json
}

resource "aws_kms_alias" "registro_central" {
  name          = "alias/registro-central"
  target_key_id = aws_kms_key.registro_central.key_id
}

data "aws_iam_policy_document" "registro_central" {
  statement {
    sid       = "AdministracaoPelaConta"
    effect    = "Allow"
    actions   = ["kms:*"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.esta.account_id}:root"]
    }
  }

  statement {
    sid       = "TrilhaEscreveCifrado"
    effect    = "Allow"
    actions   = ["kms:GenerateDataKey*", "kms:DescribeKey"]
    resources = ["*"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:aws:cloudtrail:${var.regiao_residencia}:${data.aws_caller_identity.esta.account_id}:trail/aws-controltower-BaselineCloudTrail"]
    }
  }

  statement {
    sid       = "AgregadorEscreveCifrado"
    effect    = "Allow"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt", "kms:DescribeKey"]
    resources = ["*"]

    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }
  }

  statement {
    sid       = "ContasDaOrganizacaoLeem"
    effect    = "Allow"
    actions   = ["kms:Decrypt", "kms:DescribeKey"]
    resources = ["*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:PrincipalOrgID"
      values   = [data.aws_organizations_organization.esta.id]
    }
  }
}

data "aws_caller_identity" "esta" {}

data "aws_organizations_organization" "esta" {}

resource "aws_controltower_landing_zone" "esta" {
  version           = "4.0"
  remediation_types = var.remediation_types

  # A dependência é das policies, e não só das roles: role sem a permissão
  # anexada existe e não serve, e o `CreateLandingZone` falha igual.
  depends_on = [
    aws_iam_role_policy.controltower_admin,
    aws_iam_role_policy_attachment.controltower_admin,
    aws_iam_role_policy.controltower_stackset,
    aws_iam_role_policy_attachment.controltower_cloudtrail,
  ]

  manifest_json = jsonencode({
    # a região onde a landing zone é implantada entra sempre na lista governada,
    # e a AWS recusa a criação quando ela falta
    governedRegions = distinct([var.regiao_residencia, var.regiao_secundaria])

    centralizedLogging = {
      enabled   = true
      accountId = aws_organizations_account.log_archive.id
      configurations = {
        loggingBucket       = { retentionDays = var.retencao_log_dias }
        accessLoggingBucket = { retentionDays = var.retencao_log_dias }
        kmsKeyArn           = aws_kms_key.registro_central.arn
      }
    }

    # PREMISSA (dono: superintendente de infra, prazo: antes do primeiro apply
    # na conta real): config e securityRoles apontam para a mesma conta audit. O
    # exemplo de manifesto da própria AWS em lz-api-launch usa um único id nas
    # duas chaves, então a API aceita. A alternativa é uma terceira conta
    # dedicada ao agregador de Config, que config-updates-v4 descreve como o
    # arranjo de cliente novo. Conta a mais na fundação é decisão do cliente, e
    # mudar depois exige atualizar a landing zone.
    config = {
      enabled   = true
      accountId = aws_organizations_account.audit.id
      configurations = {
        loggingBucket       = { retentionDays = var.retencao_log_dias }
        accessLoggingBucket = { retentionDays = var.retencao_log_dias }
        kmsKeyArn           = aws_kms_key.registro_central.arn
      }
    }

    securityRoles = {
      enabled   = true
      accountId = aws_organizations_account.audit.id
    }

    accessManagement = { enabled = true }

    # o backup organizacional do desenho é política de Organizations com vault
    # e cópia entre regiões, e mora na célula fundacao/08-backup. Ligar a
    # integração de Backup aqui pediria mais duas contas (backupAdmin e
    # centralBackup) e um ARN de chave KMS, que o schema exige juntos quando
    # `enabled` é true. Fica desligado, declarado, e não omitido.
    backup = { enabled = false }
  })

  lifecycle {
    prevent_destroy = true
  }
}
