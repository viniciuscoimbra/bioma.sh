# Organismo job-agendado: o compute PERMANENTE de uma Lambda que roda por
# agenda, em qualquer domínio. É a irmã permanente de
# esteira/ambiente-efemero-job, e o par delas é o mesmo que
# core-banking/desembolso faz com esteira/ambiente-efemero para o serviço de
# porta HTTP: o efêmero nasce e morre com o PR, e este é o alvo que sobrevive
# entre deploys, para o `aws lambda update-function-code` da esteira ter onde
# pousar.
#
# Por que uma receita e não mais uma cópia: o padrão do agendamento já existia
# em três lugares desta árvore (esteira/limpeza-efemero,
# core-banking/reconciliacao-ledger, barramento/dlt-inspecao), sempre igual e
# sempre reescrito, e a quarta cópia seria de um domínio que nem é o dono do
# padrão. O que muda entre eles é o nome, a agenda e a carga; o resto é
# estrutura.
#
# ── EventBridge Scheduler, e não EventBridge Rules ──────────────────────────
# São dois serviços, e a confusão custa caro na hora de procurar: função
# acionada por Scheduler aparece com ZERO event source mappings e NENHUMA
# rule, e `lambda get-policy` não a menciona. Parece órfã, e não é. As três
# implementações que este organismo generaliza já usavam Scheduler; esta linha
# existe para quem for auditar o gatilho depois.
#
# ── o que NÃO nasce aqui ────────────────────────────────────────────────────
# A VPC, a chave do domínio, o cofre e a imagem são de células permanentes de
# base. E a fila de descarte não nasce: um job de agenda que falha não tem
# mensagem para devolver a lugar nenhum, o alarme de erro da própria
# funcao-processadora é quem avisa, e a execução seguinte é a próxima da
# agenda.

module "funcao" {
  source = "../../../moleculas/funcao-processadora"

  nome           = var.nome
  imagem_inicial = var.imagem_inicial

  memoria_mb         = var.memoria_mb
  timeout_s          = var.timeout_s
  kms_key_arn        = var.kms_key_arn
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  alarm_actions      = var.alarm_actions

  variaveis_de_ambiente = merge(
    var.variaveis_de_ambiente,
    var.segredo_arn == null ? {} : {
      SecretsManager__SecretId = var.segredo_arn
    },
  )

  tags = { servico = var.servico, ambiente = var.ambiente }
}

# Leitura do cofre da aplicação: menor privilégio, só GetSecretValue no ARN
# específico.
#
# O `kms:Decrypt` junto não é zelo: o cofre é cifrado por chave da instituição,
# e essa chave MORA EM OUTRA CONTA. Entre contas a key policy sozinha não
# basta, e sem este statement o `GetSecretValue` volta AccessDenied vindo do
# KMS, com a aplicação falhando no startup e a rede toda resolvida. Chave nula
# pula o statement, que é o caso do cofre cifrado pela chave gerenciada da AWS.
resource "aws_iam_role_policy" "le_segredo" {
  count = var.segredo_arn == null ? 0 : 1

  name = "le-segredo-aplicacao"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [{
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = var.segredo_arn
      }],
      var.kms_key_arn == null ? [] : [{
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.kms_key_arn
      }]
    )
  })
}

# O alias com o nome do ambiente é o alvo estável que a esteira reaponta a cada
# deploy, sem reescrever nada além da versão. Mesmo padrão do irmão de porta
# HTTP.
resource "aws_lambda_alias" "este" {
  name             = var.ambiente
  function_name    = module.funcao.nome_da_funcao
  function_version = "$LATEST"

  lifecycle {
    ignore_changes = [function_version]
  }
}

# ── o gatilho ───────────────────────────────────────────────────────────────

resource "aws_iam_role" "agendador" {
  name = "${var.nome}-agendador"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "scheduler.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "invoca" {
  name = "invoca-o-job"
  role = aws_iam_role.agendador.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = module.funcao.funcao_arn
    }]
  })
}

resource "aws_scheduler_schedule" "agenda" {
  name                = var.nome
  schedule_expression = var.agenda
  state               = var.estado

  # OFF, como nas três implementações que este organismo generaliza. Janela
  # flexível existe para espalhar carga entre execuções de muitos alvos, e o
  # preço dela é não saber a que horas o job rodou. Num job que escreve, saber
  # a hora vale mais do que espalhar.
  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = module.funcao.funcao_arn
    role_arn = aws_iam_role.agendador.arn
    # Carga nula omite o atributo: o Scheduler entrega um evento vazio, e é o
    # que a maioria dos jobs quer. Quem precisa de parâmetro passa o objeto.
    input = var.carga == null ? null : jsonencode(var.carga)
  }
}
