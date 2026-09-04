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

# O balde que recebe o registro de acesso dos outros baldes da conta.
#
# Registro de acesso responde "quem leu o quê", e nenhum balde consegue guardar
# o próprio: o destino tem que ser outro balde, na mesma região. Sem um destino
# que exista em toda conta, cada organismo que cria balde teria de criar o seu,
# e o registro ficaria espalhado em tantos lugares quanto há receitas.
#
# Ele mora no piso porque o piso é o único que roda em toda conta, inclusive nas
# que ainda não têm carga — e uma conta sem carga é justamente onde o primeiro
# balde vai nascer.
resource "aws_s3_bucket" "acesso" {
  bucket = "gf-acesso-${data.aws_caller_identity.esta.account_id}-${data.aws_region.primaria.region}"

  # Apagar este balde é apagar o registro de quem leu o quê, e registro de
  # acesso é o que se consulta depois do incidente.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "acesso" {
  bucket = aws_s3_bucket.acesso.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "acesso" {
  bucket = aws_s3_bucket.acesso.id

  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "acesso" {
  bucket                  = aws_s3_bucket.acesso.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# O serviço de registro escreve como serviço, e não como quem pediu a leitura.
# A condição de conta de origem impede que balde de outra conta despeje registro
# aqui, o que seria uma forma barata de encher balde alheio.
data "aws_iam_policy_document" "acesso" {
  statement {
    sid       = "NegaTransporteInseguro"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.acesso.arn, "${aws_s3_bucket.acesso.arn}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }

  statement {
    sid       = "ServicoDeRegistroEscreve"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.acesso.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["logging.s3.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.esta.account_id]
    }
  }
}

# O registro de fluxo da VPC é entregue por outro serviço, com outro principal,
# e por isso precisa da própria linha. Ele responde uma pergunta diferente da do
# registro de acesso — "que pacote passou" em vez de "quem leu o quê" —, mas cai
# no mesmo balde porque o balde é o da conta, e não o de um tipo de registro.
resource "aws_s3_bucket_policy" "acesso_recebe_fluxo" {
  bucket = aws_s3_bucket.acesso.id
  policy = data.aws_iam_policy_document.acesso_completa.json
}

data "aws_iam_policy_document" "acesso_completa" {
  source_policy_documents = [data.aws_iam_policy_document.acesso.json]

  statement {
    sid       = "EntregaDeRegistroEscreve"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.acesso.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["delivery.logs.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.esta.account_id]
    }
  }

  statement {
    sid       = "EntregaDeRegistroConfere"
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl", "s3:ListBucket"]
    resources = [aws_s3_bucket.acesso.arn]

    principals {
      type        = "Service"
      identifiers = ["delivery.logs.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.esta.account_id]
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "acesso" {
  bucket = aws_s3_bucket.acesso.id

  rule {
    id     = "recolhe-registro-velho"
    status = "Enabled"
    filter {}

    expiration { days = var.dias_registro_de_acesso }

    noncurrent_version_expiration { noncurrent_days = 30 }
  }
}

# O balde de registro aponta para si mesmo. Não é curiosidade: o controle exige
# destino em todo balde, e um balde que guardasse o próprio registro em outro
# criaria uma corrente sem fim. Apontando para si, ele satisfaz a regra e o
# volume fica desprezível, porque quase ninguém lê registro de acesso.
resource "aws_s3_bucket_logging" "acesso" {
  bucket        = aws_s3_bucket.acesso.id
  target_bucket = aws_s3_bucket.acesso.id
  target_prefix = "proprio/"
}

# Quem abre chamado com a AWS precisa de permissão para isso, e a permissão não
# vem com nenhum papel administrativo: é uma política própria. Sem ela, o
# incidente vira "não consigo nem abrir o caso", que é o pior momento para
# descobrir uma permissão faltando.
#
# A função existe para ser assumida por quem opera, e não por serviço: a
# confiança é da própria conta, e quem pode assumi-la se decide por política de
# identidade, no Identity Center.
resource "aws_iam_role" "suporte" {
  count = var.recursos_da_conta ? 1 : 0

  name               = "acesso-ao-suporte"
  description        = "abre e acompanha caso de suporte da AWS"
  assume_role_policy = data.aws_iam_policy_document.suporte_confia.json
}

resource "aws_iam_role_policy_attachment" "suporte" {
  count = var.recursos_da_conta ? 1 : 0

  role       = aws_iam_role.suporte[0].name
  policy_arn = "arn:aws:iam::aws:policy/AWSSupportAccess"
}

data "aws_iam_policy_document" "suporte_confia" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.esta.account_id}:root"]
    }
  }
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

# A automação do Systems Manager executa script na instância, e por padrão não
# guarda o que executou. `None` quer dizer que o comando roda e não deixa rastro
# — em conta de instituição regulada, é o oposto do que se quer de uma
# ferramenta que alcança toda máquina.
resource "aws_ssm_service_setting" "automacao_com_log_primaria" {
  setting_id    = "arn:aws:ssm:${data.aws_region.primaria.region}:${data.aws_caller_identity.esta.account_id}:servicesetting/ssm/automation/customer-script-log-destination"
  setting_value = "CloudWatch"
}

resource "aws_ssm_service_setting" "automacao_com_log_secundaria" {
  provider = aws.secundaria

  setting_id    = "arn:aws:ssm:${data.aws_region.secundaria.region}:${data.aws_caller_identity.esta.account_id}:servicesetting/ssm/automation/customer-script-log-destination"
  setting_value = "CloudWatch"
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

# O analisador de acesso externo já existe no nível da organização, na conta
# delegada, e funcionalmente enxerga as 49. Mas o controle IAM.28 pergunta outra
# coisa: se ESTA conta tem analisador próprio. São perguntas diferentes com a
# mesma resposta aparente, e é por isso que 48 contas reprovavam com a detecção
# inteira de pé — a mesma armadilha do GuardDuty, onde delegar alcança só a conta
# delegada e o alcance às demais exige um segundo ato.
#
# Duplicar não custa: analisador de tipo ACCOUNT com acesso externo é gratuito, e
# o que ele acha na conta é subconjunto do que o de organização já achava. O que
# muda é quem consegue ver o achado sem credencial da conta de segurança — o time
# do domínio passa a enxergar o próprio.
resource "aws_accessanalyzer_analyzer" "primaria" {
  count = var.recursos_da_conta ? 1 : 0

  analyzer_name = "conta-${data.aws_caller_identity.esta.account_id}"
  type          = "ACCOUNT"
}

resource "aws_accessanalyzer_analyzer" "secundaria" {
  count = var.recursos_da_conta ? 1 : 0

  provider = aws.secundaria

  analyzer_name = "conta-${data.aws_caller_identity.esta.account_id}"
  type          = "ACCOUNT"
}

# O balde de ESTADO desta conta, que é o único da frota que ninguém declara.
#
# Ele nasce do bootstrap do Terragrunt, antes de existir célula que o pudesse
# criar, e por isso vinha sem registro de acesso e sem ciclo de vida: numa
# organização de cinquenta contas isso é um balde por conta, e foram 106 dos
# achados de S3 dessa instalação. O resto da frota já nasce certo pela molécula.
#
# Configurar aqui é o único lugar possível, e é sólido: o piso já roda em toda
# conta, e o balde que ele configura é justamente onde o estado DELE mora, então
# existir é pré-requisito do próprio apply. Os dois recursos abaixo não criam
# nada; eles vestem um balde que já está de pé.
resource "aws_s3_bucket_logging" "estado" {
  count = var.balde_de_estado == "" ? 0 : 1

  bucket        = var.balde_de_estado
  target_bucket = aws_s3_bucket.acesso.id
  target_prefix = "${var.balde_de_estado}/"
}

# Estado do Terraform versiona por desenho: cada apply grava uma versão nova, e
# nenhuma some sozinha. Sem regra, o balde guarda para sempre a série inteira de
# uma árvore que aplica dezenas de vezes por dia.
#
# A versão ANTIGA expira; a atual nunca. É o que separa este ciclo de vida de um
# que apaga estado: o objeto corrente fica intocado, e o que sai é a cauda que
# só serviria para uma recuperação manual que a esta altura já teria acontecido.
resource "aws_s3_bucket_lifecycle_configuration" "estado" {
  count = var.balde_de_estado == "" ? 0 : 1

  bucket = var.balde_de_estado

  rule {
    id     = "versao-antiga-de-estado-expira"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.dias_estado_antigo
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

data "aws_caller_identity" "esta" {}

data "aws_region" "primaria" {}

data "aws_region" "secundaria" {
  provider = aws.secundaria
}
