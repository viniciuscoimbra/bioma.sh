# Organismo acesso-auditado (03·D2, 15·D2): o acesso humano a uma conta deixa
# rastro que a instituição guarda.
#
# papel: grava toda sessão de terminal aberta por Session Manager, no balde da
#   própria conta, e publica a política que limita quem entra e onde
# cria: balde da gravação (versionado, cifrado, sem acesso público), documento
#   de sessão que liga a gravação, grupo de log, e a política de acesso por
#   etiqueta
# nao_cria: quem tem acesso (isso é atribuição, no Identity Center), nem as
#   máquinas, nem a rede
# recebe: dominio, ambiente, a chave que cifra, e a etiqueta que marca a
#   máquina alcançável
# publica: o ARN da política de acesso, o nome do balde e o do documento
# durabilidade: permanente. Gravação de acesso é prova, e prova não se recria.
# local: fora (o emulador não tem Session Manager)
# custo: baixo
# premissas:
#   - a instituição guarda a prova, e não o fornecedor: PAM de terceiro pode
#     existir do lado dele, e não substitui esta gravação
#   - a máquina alcançável é a que carrega a etiqueta; sem etiqueta, ninguém
#     entra por este caminho

data "aws_region" "esta" {}

resource "aws_s3_bucket" "gravacao" {
  # A REGIÃO ENTRA NO NOME pela mesma razão do lake: nome de balde é global E
  # amarrado a uma região, e o nome recém-apagado continua roteando para a
  # região antiga por mais de uma hora. Mover de região vira espera em vez de
  # ato, e o `CreateBucket` recusa com `the region 'us-east-1' is wrong;
  # expecting 'sa-east-1'`. Com a região no nome, o balde novo nasce ao lado do
  # velho. Medido em 2026-09-04, movendo a não-produção para Virgínia.
  #
  # A região vem do PROVIDER e não de variável: a região da célula não é a da
  # instância, e essa confusão custou quatro vezes num dia só.
  bucket = "${var.prefixo}-sessao-${var.dominio}-${var.ambiente}-${data.aws_region.esta.region}"

  # Prova não se apaga por rotina: quem precisar remover passa por decisão
  # humana, e não por um apply que mudou de ideia.
  lifecycle { prevent_destroy = true }
}

resource "aws_s3_bucket_versioning" "gravacao" {
  bucket = aws_s3_bucket.gravacao.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "gravacao" {
  bucket = aws_s3_bucket.gravacao.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "gravacao" {
  bucket                  = aws_s3_bucket.gravacao.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudwatch_log_group" "sessao" {
  name              = "/sessao/${var.dominio}/${var.ambiente}"
  retention_in_days = var.retencao_dias
  kms_key_id        = var.kms_key_arn
}

# O documento de sessão com o nome que o Session Manager procura. Sem ele o
# serviço usa o default, que NÃO grava nada: o acesso acontece e não deixa
# rastro, que é o oposto do que uma conta regulada precisa.
resource "aws_ssm_document" "sessao" {
  name            = "SSM-SessionManagerRunShell"
  document_type   = "Session"
  document_format = "JSON"

  content = jsonencode({
    schemaVersion = "1.0"
    description   = "gravacao de sessao na conta da instituicao"
    sessionType   = "Standard_Stream"
    inputs = {
      s3BucketName                = aws_s3_bucket.gravacao.id
      s3EncryptionEnabled         = true
      cloudWatchLogGroupName      = aws_cloudwatch_log_group.sessao.name
      cloudWatchEncryptionEnabled = true
      cloudWatchStreamingEnabled  = true
      kmsKeyId                    = var.kms_key_arn
      idleSessionTimeout          = tostring(var.minutos_ocioso)
      runAsEnabled                = false
    }
  })
}

# As políticas de quem entra. Elas não dão acesso a ninguém: quem atribui é o
# Identity Center. O que elas fazem é limitar o alcance, e é isso que separa o
# acesso de um fornecedor externo do acesso do time que é dono do domínio.
#
# Um círculo é um conjunto de máquinas, dito pelos valores da etiqueta que ele
# alcança. Uma política por círculo, e o Identity Center escolhe qual entra em
# cada conjunto de permissão.
#
# A gravação NÃO distingue círculo, e a ausência dela aqui não é esquecimento:
# o documento de sessão é da conta e vale para toda sessão, de qualquer perfil.
# Um alcance não é mais nem menos auditado que outro, e pôr "auditado" no nome
# de um deles descreveria uma diferença que não existe.
data "aws_iam_policy_document" "acesso" {
  for_each = var.circulos

  # 1. só as máquinas deste círculo
  statement {
    sid       = "SessaoNasMaquinasDoCirculo"
    effect    = "Allow"
    actions   = ["ssm:StartSession"]
    resources = ["arn:aws:ec2:*:*:instance/*"]

    condition {
      test     = "StringEquals"
      variable = "ssm:resourceTag/${var.etiqueta}"
      values   = each.value
    }
  }

  # 2. e só pelo documento que grava
  statement {
    sid       = "SomenteODocumentoQueGrava"
    effect    = "Allow"
    actions   = ["ssm:StartSession"]
    resources = [aws_ssm_document.sessao.arn]
  }

  # Encerrar e retomar a PRÓPRIA sessão. Sem isto a pessoa não consegue sair
  # nem voltar de uma queda, e a saída vira pedir para outro encerrar.
  statement {
    sid       = "CuidarDaPropriaSessao"
    effect    = "Allow"
    actions   = ["ssm:TerminateSession", "ssm:ResumeSession"]
    resources = ["arn:aws:ssm:*:*:session/$${aws:username}-*"]
  }

  # O que a sessão precisa para abrir o canal. Sem recurso próprio na API.
  statement {
    sid       = "AberturaDoCanal"
    effect    = "Allow"
    actions   = ["ssm:DescribeSessions", "ssm:GetConnectionStatus", "ssm:DescribeInstanceProperties", "ec2:DescribeInstances"]
    resources = ["*"]
  }

  # A sessão é cifrada pela chave que o documento acima declara em `kmsKeyId`,
  # e quem abre a sessão cifra o próprio lado do canal. Sem este statement o
  # `StartSession` é aceito e a sessão morre no aperto de mão, com AccessDenied
  # em `kms:GenerateDataKey`: a mensagem fala da chave e não da política, e o
  # erro some para quem tem AdministratorAccess, o que faz o defeito parecer da
  # pessoa e não do código. Aconteceu com dois acessos em 2026-08-21.
  #
  # A ponta do dono da chave já concede: a key policy de `chave-dominio` admite
  # as ações de uso para a Organization inteira, e é por isso que a travessia
  # está declarada como `concedida_na_fonte`. Nesse modelo, quem recorta o uso
  # é o IAM da conta que consome — e era essa ponta que faltava.
  #
  # As duas ações juntas porque foi com as duas que a sessão subiu: o cliente
  # gera a chave de dados do canal e decifra o que volta pela outra ponta. É a
  # mesma dupla que a política da máquina já carrega em `CifrarAGravacao`, e
  # sobre a MESMA chave: o alcance não cresce, ele deixa de faltar de um lado.
  statement {
    sid       = "CifrarOCanalDaSessao"
    effect    = "Allow"
    actions   = ["kms:GenerateDataKey", "kms:Decrypt"]
    resources = [var.kms_key_arn]
  }
}

resource "aws_iam_policy" "acesso" {
  for_each = var.circulos

  # Sem domínio nem ambiente no nome, de propósito: o Identity Center
  # referencia política da conta POR NOME, e um conjunto genérico só entrega
  # alcance específico se o nome for o mesmo em toda conta. O nome é contrato;
  # o conteúdo é desta conta. Namespace de IAM é por conta, então não colide.
  name        = lookup(var.nomes_dos_circulos, each.key, "acesso-${each.key}")
  description = "sessao nas maquinas do circulo ${each.key}"
  policy      = data.aws_iam_policy_document.acesso[each.key].json
}

# A política de quem GRAVA, que é a máquina e não a pessoa. Quem escreve a
# gravação é o agente do SSM com a role da instância, e `AmazonSSMManagedInstanceCore`
# não dá nada de CloudWatch Logs nem de S3: com o documento acima ligado e sem
# esta política, a sessão é recusada com "encryption is not set up on the
# selected CloudWatch Logs log group". A mensagem culpa o grupo de log, que
# está cifrado; o que falta é a máquina poder LER que ele está.
#
# Ela é gerenciada e publicada porque quem hospeda a gravação não é quem
# hospeda a máquina: o destino nasce aqui, a instância mora noutra célula, e
# escrever isto lá em cada organismo de máquina era repetir a mesma permissão
# em três lugares que divergem.
data "aws_iam_policy_document" "gravacao" {
  # DescribeLogGroups é a chamada que o agente usa para descobrir que o grupo
  # está cifrado, e ela lista em vez de apontar: restringi-la a um ARN de grupo
  # não vale nada. Com `arn:aws:logs:*:*:log-group:*` no lugar do asterisco, o
  # simulador de política nega mesmo contra recurso `*`, e a sessão morre
  # dizendo que o grupo não está cifrado.
  statement {
    sid       = "VerACifragemDoGrupo"
    effect    = "Allow"
    actions   = ["logs:DescribeLogGroups"]
    resources = ["*"]
  }

  statement {
    sid       = "EscreverAGravacaoNoLog"
    effect    = "Allow"
    actions   = ["logs:CreateLogStream", "logs:DescribeLogStreams", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.sessao.arn}:*"]
  }

  statement {
    sid       = "EscreverAGravacaoNoBalde"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.gravacao.arn}/*"]
  }

  # O agente confere a cifragem do balde antes de escrever, pelo mesmo motivo
  # do grupo de log.
  statement {
    sid       = "VerACifragemDoBalde"
    effect    = "Allow"
    actions   = ["s3:GetEncryptionConfiguration"]
    resources = [aws_s3_bucket.gravacao.arn]
  }

  statement {
    sid       = "CifrarAGravacao"
    effect    = "Allow"
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = [var.kms_key_arn]
  }
}

resource "aws_iam_policy" "gravacao" {
  name        = "gravar-sessao-${var.dominio}-${var.ambiente}"
  description = "o que a maquina precisa para escrever a gravacao da sessao"
  policy      = data.aws_iam_policy_document.gravacao.json
}

# O balde aceita HTTP por padrão, e HTTP num balde de gravação de sessão é o mesmo dado
# viajando em claro. A política recusa antes: quem chegar sem TLS leva negação,
# e não uma resposta.
resource "aws_s3_bucket_policy" "gravacao_so_com_tls" {
  bucket = aws_s3_bucket.gravacao.id
  policy = data.aws_iam_policy_document.gravacao_so_com_tls.json
}

data "aws_iam_policy_document" "gravacao_so_com_tls" {
  statement {
    sid       = "NegaSemTLS"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.gravacao.arn, "${aws_s3_bucket.gravacao.arn}/*"]

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
}

# Versão antiga que ninguém lê continua sendo dado guardado e cobrado. O ciclo
# de vida não apaga o objeto corrente: ele recolhe as versões anteriores e as
# partes de envio que ficaram pelo caminho.
resource "aws_s3_bucket_lifecycle_configuration" "gravacao" {
  bucket = aws_s3_bucket.gravacao.id

  rule {
    id     = "recolhe-versao-antiga-e-envio-incompleto"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.dias_versao_antiga
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# O destino do registro de acesso é o balde que o piso da conta cria, e o nome
# dele é determinístico de propósito: assim esta receita não precisa depender do
# estado de outra célula para saber para onde apontar.
resource "aws_s3_bucket_logging" "gravacao" {
  bucket        = aws_s3_bucket.gravacao.id
  target_bucket = "gf-acesso-${data.aws_caller_identity.registro.account_id}-${data.aws_region.registro.region}"
  target_prefix = "${aws_s3_bucket.gravacao.id}/"
}

data "aws_caller_identity" "registro" {}

data "aws_region" "registro" {}
