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

resource "aws_s3_bucket" "gravacao" {
  bucket = "${var.prefixo}-sessao-${var.dominio}-${var.ambiente}"

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

# A política de quem entra. Ela não dá acesso a ninguém: quem atribui é o
# Identity Center. O que ela faz é limitar o alcance a duas coisas, e é isso
# que separa "acesso de fornecedor" de "acesso à conta".
data "aws_iam_policy_document" "acesso" {
  # 1. só as máquinas com a etiqueta combinada
  statement {
    sid       = "SessaoNasMaquinasEtiquetadas"
    effect    = "Allow"
    actions   = ["ssm:StartSession"]
    resources = ["arn:aws:ec2:*:*:instance/*"]

    condition {
      test     = "StringEquals"
      variable = "ssm:resourceTag/${var.etiqueta}"
      values   = var.valores_da_etiqueta
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
}

resource "aws_iam_policy" "acesso" {
  name        = "acesso-${var.etiqueta}-${var.dominio}-${var.ambiente}"
  description = "sessao gravada, so nas maquinas etiquetadas"
  policy      = data.aws_iam_policy_document.acesso.json
}
