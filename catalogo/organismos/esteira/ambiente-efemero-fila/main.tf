# Organismo ambiente-efemero-fila (15·D7, 15.2 §3): o irmão do
# `ambiente-efemero` para a função que NÃO tem porta síncrona. Compõe
# funcao-processadora (o compute), a fila que a aciona e o mapeamento entre as
# duas, e mais nada: sem api-privada, sem custom domain, sem certificado e sem
# registro DNS.
#
# Por que existe em vez de um flag no irmão: o efêmero síncrono é quase todo
# porta (o FQDN de um rótulo, o wildcard que o cobre, a associação ao VPC
# endpoint, a resource policy que só admite aquele endpoint). Uma função de
# fila não usa nada disso, e o que ela precisa (visibilidade da fila casada com
# o timeout, descarte, mapeamento) não existe lá. Um organismo só seria dois
# organismos dentro de um `count`, com metade do plano sempre morta.
#
# Aplicada pela ESTEIRA, nunca pelo live: o gatilho é o evento do PR, e o
# `terragrunt destroy` no encerramento é parte do contrato, não exceção.
#
# O que NÃO nasce aqui, e por quê: a VPC é de vpc-dominio; a chave do domínio é
# da conta de segurança; o segredo é de dominio-base/segredo-servico; a imagem
# é da esteira. Todos permanentes: o efêmero é só a aplicação e a fila dela.
#
# O que esta receita NÃO atende, e é decisão e não esquecimento: função
# acionada por tópico Kafka. O cluster do barramento roda com
# `auto.create.topics.enable=false`, então um tópico por PR nasceria pela
# molécula topico-kafka, que só aplica de DENTRO da VPC do barramento, pelo
# executor de build de outra conta. O preview passaria a depender de outra
# conta e de um build para subir. A decisão está registrada na instância que a
# tomou; aqui fica a razão, para quem for tentado a acrescentar o gatilho.

locals {
  nome = "${var.servico}-${var.prefixo}"

  # As etiquetas que a esteira consulta. O teto de ambientes vivos conta por
  # `efemero`, e a caça a órfãos casa `efemero` com `prefixo` (Resource Groups
  # Tagging API). Recurso desta stack sem estas duas não é encontrado pela
  # varredura, e vira custo silencioso. Valem para a fila tanto quanto para a
  # função: fila órfã não custa parada, mas some do inventário do mesmo jeito.
  etiquetas = {
    efemero = var.tipo
    prefixo = var.prefixo
    servico = var.servico
  }

  # A janela em que a mensagem fica invisível para os outros consumidores
  # depois de entregue. A AWS RECUSA o mapeamento se ela for menor que o
  # timeout da função, e o guia do serviço pede seis vezes o timeout para
  # absorver as tentativas do lote. Derivar daqui é o que impede o defeito
  # clássico: com a janela curta a mensagem reaparece enquanto a função ainda a
  # processa, e o mesmo evento roda duas vezes sem erro nenhum na tela.
  #
  # O teto de 43200 (doze horas) é do SQS. Um timeout de Lambda não chega perto
  # dele (o máximo é quinze minutos), mas o `min` deixa a conta honesta em vez
  # de depender de o chamador não exagerar.
  visibilidade_s = min(var.timeout_s * 6, 43200)
}

# ── a fila que aciona ──────────────────────────────────────────────────────

# Fila de descarte antes da principal: o `redrive_policy` da principal aponta
# para o ARN desta, então ela precisa existir primeiro. Sem descarte, mensagem
# que o código em revisão não consegue processar volta para sempre, e o preview
# vira um laço quente que ninguém vê até a fatura.
resource "aws_sqs_queue" "descarte" {
  name = "${local.nome}-descarte"

  # Cifra: a chave do domínio quando ela é conhecida, e a gerenciada do SQS
  # quando não. Fila sem cifra nenhuma não é opção nem no efêmero, porque a
  # mensagem de teste carrega o mesmo formato da de produção.
  #
  # Os dois atributos são excludentes na API, e é por isso que o que não vale
  # recebe `null` em vez de `false`: null é como o Terraform omite atributo,
  # e false seria uma declaração de "gerenciada desligada" junto de uma chave
  # declarada. `terraform validate` não vê conflito de provider nem recusa de
  # API, então esta linha é conferida por leitura e pelo primeiro apply.
  kms_master_key_id       = var.kms_key_arn
  sqs_managed_sse_enabled = var.kms_key_arn == null ? true : null

  message_retention_seconds = var.retencao_mensagem_s

  tags = local.etiquetas
}

resource "aws_sqs_queue" "entrada" {
  name = local.nome

  kms_master_key_id       = var.kms_key_arn
  sqs_managed_sse_enabled = var.kms_key_arn == null ? true : null

  message_retention_seconds  = var.retencao_mensagem_s
  visibility_timeout_seconds = local.visibilidade_s

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.descarte.arn
    maxReceiveCount     = var.tentativas_antes_da_dlt
  })

  tags = local.etiquetas
}

# ── compute ────────────────────────────────────────────────────────────────

module "funcao" {
  source = "../../../moleculas/funcao-processadora"

  nome           = local.nome
  imagem_inicial = var.referencia_artefato

  memoria_mb         = var.memoria_mb
  timeout_s          = var.timeout_s
  retencao_log_dias  = var.retencao_log_dias
  kms_key_arn        = var.kms_key_arn
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  tags               = local.etiquetas

  # Três camadas, e a ordem do merge é o contrato: o que a instância manda
  # entra primeiro, o segredo depois, e a fila por último. A URL da fila é a
  # única coisa que só esta receita sabe (o nome carrega o prefixo do PR), e
  # deixá-la vencer é o que impede uma env var herdada de dev apontar o preview
  # para a fila permanente.
  variaveis_de_ambiente = merge(
    var.variaveis_de_ambiente,
    var.segredo_arn == null ? {} : {
      SecretsManager__SecretId = var.segredo_arn
    },
    {
      (var.nome_da_variavel_da_fila) = aws_sqs_queue.entrada.url
    }
  )
}

data "aws_region" "esta" {}

# ── o que liga a fila à função ─────────────────────────────────────────────

# Quem lê a fila é o serviço do Lambda, com a role da função, e não a função
# em si: por isso a permissão mora na role e o mapeamento não recebe
# credencial. `GetQueueAttributes` entra junto de propósito, e é o que falta
# com mais frequência: sem ele o mapeamento nasce e fica em `Disabled` com
# "problem with the queue configuration", que não se parece com falta de
# permissão.
resource "aws_iam_role_policy" "consome_fila" {
  name = "consome-fila-do-efemero"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      [{
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ]
        Resource = [aws_sqs_queue.entrada.arn, aws_sqs_queue.descarte.arn]
      }],
      # Fila cifrada por chave da instituição só entrega para quem também pode
      # decifrar, e a chave mora em outra conta: entre contas, a key policy
      # sozinha não basta. Mesmo par de statements que a leitura do segredo usa
      # logo abaixo, e o sintoma quando falta é o mesmo, um AccessDenied que
      # vem do KMS e não do SQS.
      var.kms_key_arn == null ? [] : [{
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      }]
    )
  })
}

# O mapeamento espera a permissão existir. Sem o `depends_on`, o Terraform
# cria os dois em paralelo e o mapeamento nasce desabilitado, com a mesma
# mensagem de configuração da fila: o apply termina verde e o preview não
# consome nada.
resource "aws_lambda_event_source_mapping" "fila" {
  event_source_arn = aws_sqs_queue.entrada.arn
  function_name    = module.funcao.funcao_arn
  batch_size       = var.tamanho_do_lote
  enabled          = true

  depends_on = [aws_iam_role_policy.consome_fila]
}

# ── leitura do segredo da aplicação ────────────────────────────────────────
# Mesmo padrão do irmão síncrono e de core-banking/desembolso. Pula por
# completo quando segredo_arn é null (smoke test sem secret real).
#
# `kms:Decrypt` junto, e não só `GetSecretValue`: cofre cifrado por chave
# gerenciada pela instituição só abre para quem também pode decifrar. Sem isto
# a leitura volta AccessDenied vindo do KMS, e a aplicação falha no startup com
# toda a rede resolvida. Com a chave conhecida, a permissão aponta o ARN dela;
# sem ela, `ViaService` faz o papel do recurso, e o QUE se pode ler continua
# preso ao ARN do statement acima.
resource "aws_iam_role_policy" "le_segredo" {
  count = var.segredo_arn == null ? 0 : 1

  name = "le-segredo-aplicacao"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    # Uma lista por ramo, e não um ternário entre os dois objetos: HCL não
    # unifica objetos com atributos diferentes (um tem `Condition`, o outro
    # não), e o plano quebraria com "inconsistent conditional result types".
    Statement = concat(
      [{
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = var.segredo_arn
      }],
      # Dois ramos, cada um numa lista própria e nunca um ternário entre os
      # dois objetos: um tem `Condition` e o outro não, e o ternário exigiria
      # que HCL unificasse os tipos. Entre listas o concat resolve.
      var.kms_key_arn == null ? [] : [{
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.kms_key_arn
      }],
      var.kms_key_arn != null ? [] : [{
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${data.aws_region.esta.region}.amazonaws.com"
          }
        }
      }],
    )
  })
}

# ── decifrar a camada da imagem ────────────────────────────────────────────
# Registro cifrado por chave própria exige a permissão no pull, e a falta dela
# aparece como imagem que não baixa, não como acesso negado a KMS.
resource "aws_iam_role_policy" "le_registro" {
  count = var.chave_do_registro_arn == null ? 0 : 1

  name = "decifra-imagem-do-registro"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "kms:Decrypt"
      Resource = var.chave_do_registro_arn
    }]
  })
}
