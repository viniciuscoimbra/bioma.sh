# Organismo piso-de-conta: os interruptores que não pertencem a recurso nenhum.
#
# Nada aqui cria infraestrutura. São ajustes da CONTA — o que ela faz por
# padrão quando alguém esquece de dizer. Cifra de disco, bloqueio de
# publicação, política de senha, contato de segurança. Cada um existe porque a
# AWS escolheu um padrão permissivo para não quebrar quem chegou antes, e
# porque instituição regulada não herda o padrão de ninguém.
#
# Metade é de conta e vale em toda parte. Metade é de região, e a que não for
# ligada nas duas fica valendo em uma só, sem erro nenhum.

# ── de conta: valem em toda região ───────────────────────────────────────────

# Sem isto, um balde nasce podendo ser tornado público por quem tiver permissão
# de escrever política. Com isto, a conta recusa antes de a política existir.
resource "aws_s3_account_public_access_block" "esta" {
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_account_password_policy" "esta" {
  minimum_password_length        = var.senha_tamanho_minimo
  require_lowercase_characters   = true
  require_uppercase_characters   = true
  require_numbers                = true
  require_symbols                = true
  password_reuse_prevention      = var.senha_reuso_proibido
  max_password_age               = var.senha_validade_dias
  allow_users_to_change_password = true
}

# O contato de segurança é o que a AWS usa para avisar de abuso e de incidente
# nesta conta. Sem ele, o aviso vai para o endereço de cadastro do root, que
# nesta organização é caixa que ninguém lê por desenho.
# O contato de segurança é o que a AWS usa para avisar de abuso e de incidente
# nesta conta. Sem ele, o aviso vai para o endereço de cadastro do root, que
# nesta organização é caixa que ninguém lê por desenho.
#
# O `count` continua existindo porque o telefone é dado que ninguém inventa: é
# o número que alguém ATENDE quando a AWS liga. Instalação que não o declarar
# fica sem o contato, e o controle reprova com razão, em vez de passar com um
# número que não toca em lugar nenhum.
resource "aws_account_alternate_contact" "seguranca" {
  count = var.telefone_contato_seguranca != "" ? 1 : 0

  alternate_contact_type = "SECURITY"

  name          = var.nome_contato_seguranca
  title         = "Contato de seguranca"
  email_address = var.email_seguranca
  phone_number  = var.telefone_contato_seguranca
}

# ── de região: precisam ser ligados em cada uma ──────────────────────────────

resource "aws_ebs_encryption_by_default" "primaria" {
  enabled = true
}

resource "aws_ebs_encryption_by_default" "secundaria" {
  provider = aws.secundaria

  enabled = true
}

# Impede que uma cópia de disco seja compartilhada com o mundo. A cópia é o
# caminho mais curto entre um disco cifrado e um vazamento, porque ela sai da
# conta sem passar por nenhuma rede.
resource "aws_ebs_snapshot_block_public_access" "primaria" {
  state = "block-all-sharing"
}

resource "aws_ebs_snapshot_block_public_access" "secundaria" {
  provider = aws.secundaria

  state = "block-all-sharing"
}

# Documento de automação do Systems Manager pode ser compartilhado publicamente,
# e documento carrega comando. Bloqueado na conta, o compartilhamento deixa de
# ser possível mesmo para quem tem permissão de alterar o documento.
resource "aws_ssm_service_setting" "documento_publico_primaria" {
  setting_id    = "arn:aws:ssm:${data.aws_region.primaria.region}:${data.aws_caller_identity.esta.account_id}:servicesetting/ssm/documents/console/public-sharing-permission"
  setting_value = "Disable"
}

resource "aws_ssm_service_setting" "documento_publico_secundaria" {
  provider = aws.secundaria

  setting_id    = "arn:aws:ssm:${data.aws_region.secundaria.region}:${data.aws_caller_identity.esta.account_id}:servicesetting/ssm/documents/console/public-sharing-permission"
  setting_value = "Disable"
}

# Bloqueio de tráfego de internet gateway no nível da VPC: vale para toda VPC da
# conta, inclusive a que alguém criar amanhã sem ler o desenho.
#
# É o recurso mais perigoso deste organismo, e por isso é o único parametrizado.
# `block-bidirectional` corta também a SAÍDA, e há conta nesta organização cujo
# trabalho é justamente ter saída: a que hospeda o gateway de inspeção e o NAT
# por onde todo mundo egressa. Aplicar o padrão ali derrubaria o egresso da
# organização inteira, e o plano não avisaria — para o Terraform é uma opção de
# conta virando outra.
#
# Quem tem gateway com propósito declara `block-ingress`, que satisfaz o
# controle e mantém a saída. Quem não tem fica com o padrão.
resource "aws_vpc_block_public_access_options" "primaria" {
  internet_gateway_block_mode = var.bloqueio_de_gateway

  # A AWS leva minutos para propagar esta opção, e o padrão do provider é curto
  # demais: o apply morre em "waiting for VPC Block Public Access Options
  # create" DEPOIS de a mudança já ter sido aceita. O resultado é o pior tipo de
  # falha — a nuvem muda, o estado não registra, e a rodada seguinte propõe
  # criar o que já existe.
  timeouts {
    create = "30m"
    update = "30m"
  }
}

resource "aws_vpc_block_public_access_options" "secundaria" {
  provider = aws.secundaria

  internet_gateway_block_mode = var.bloqueio_de_gateway

  # A AWS leva minutos para propagar esta opção, e o padrão do provider é curto
  # demais: o apply morre em "waiting for VPC Block Public Access Options
  # create" DEPOIS de a mudança já ter sido aceita. O resultado é o pior tipo de
  # falha — a nuvem muda, o estado não registra, e a rodada seguinte propõe
  # criar o que já existe.
  timeouts {
    create = "30m"
    update = "30m"
  }
}

data "aws_caller_identity" "esta" {}

data "aws_region" "primaria" {}

data "aws_region" "secundaria" {
  provider = aws.secundaria
}
