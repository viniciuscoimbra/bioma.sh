# Organismo ambiente-efemero-job (15·D7, 15.2 §3): o terceiro ambiente
# efêmero, para a função que não tem porta HTTP nem fila. É a função e mais
# nada: sem api-privada, sem custom domain, sem registro DNS, sem fila, sem
# Event Source Mapping e SEM AGENDADOR.
#
# ── por que não nasce agendador aqui ────────────────────────────────────────
#
# Esta é a decisão do organismo, e não uma omissão. Um preview que dispara
# sozinho RODA O JOB DE VERDADE, repetidas vezes, contra os dados de dev, sem
# ninguém olhando, por todo o tempo que o pull request ficar aberto. Um job de
# cron costuma escrever: reprocessa, reenvia, marca, cobra. O preview existe
# para alguém observar UMA execução do código em revisão, e a agenda é
# exatamente o que tira o observador da equação.
#
# Quem aciona o preview é o pipeline, com um invoke só, no momento em que
# alguém está lendo o resultado. `lambda:InvokeFunction` já cabe no `lambda:*`
# que as roles de esteira concedem, então não é permissão nova.
#
# A agenda pertence à célula PERMANENTE, e o padrão da casa para ela é
# `aws_scheduler_schedule` mais uma role de `scheduler.amazonaws.com`, como em
# esteira/limpeza-efemero e core-banking/reconciliacao-ledger. Vale lembrar,
# para quem for procurar depois: EventBridge Scheduler é serviço à parte do
# EventBridge Rules, e uma função acionada por ele aparece com zero event
# source mappings e nenhuma rule. Parece órfã, e não é.
#
# ── e a decisão de 2026-09-01, que parece contradizer esta ──────────────────
#
# Naquele dia, ao separar o preview por tipo de gatilho, ficou escrito:
# "Descartada nos dois a alternativa de invoke direto sem ESM: ela não prova o
# mapeamento nem o parsing do evento real, que é onde este tipo de serviço
# quebra, e dá aparência de cobertura sem a cobertura."
#
# Aquilo continua valendo, e não alcança este caso. O que estava em jogo lá era
# consumer de fila e de tópico, onde existem duas coisas de verdade para provar:
# que o mapeamento liga (ele nasce em `Disabled` calado quando a permissão
# falta) e que o evento real parseia (o envelope do SQS e o do Kafka têm forma,
# e é nela que o código quebra). Um job de cron não tem nenhuma das duas: o
# payload do Scheduler é vazio, não há mapeamento com semântica, e o que
# poderia falhar no acionamento é uma expressão de agenda que o preview não vai
# exercitar de qualquer jeito.
#
# O que sobra para provar num job é que o código roda até o fim dentro da VPC,
# com a role, o segredo e a rede reais. Invoke direto prova isso inteiro. Aqui
# ele não é o atalho que se descartou lá; é o único acionamento que existe.
#
# ── o que NÃO nasce aqui, e de quem é ───────────────────────────────────────
# A VPC é de vpc-dominio; a chave do domínio é da conta de segurança; o segredo
# é de dominio-base/segredo-servico; a imagem é da esteira. Todos permanentes:
# o efêmero é só a aplicação.
#
# Aplicado pela ESTEIRA, nunca pelo live: o gatilho é o evento do PR, e o
# `terragrunt destroy` no encerramento é parte do contrato, não exceção.

locals {
  nome = "${var.servico}-${var.prefixo}"

  # As etiquetas que a esteira consulta. O teto de ambientes vivos conta por
  # `efemero`, e a caça a órfãos casa `efemero` com `prefixo` (Resource Groups
  # Tagging API). Recurso desta stack sem estas duas não é encontrado pela
  # varredura, e vira custo silencioso.
  etiquetas = {
    efemero = var.tipo
    prefixo = var.prefixo
    servico = var.servico
  }
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

  # Duas camadas, e não três como no irmão de fila: aqui não existe URL de
  # fila para vencer o merge, porque não existe fila. O que a instância manda
  # entra primeiro e o segredo depois.
  variaveis_de_ambiente = merge(
    var.variaveis_de_ambiente,
    var.segredo_arn == null ? {} : {
      SecretsManager__SecretId = var.segredo_arn
    },
  )
}

data "aws_region" "esta" {}

# ── leitura do segredo da aplicação ────────────────────────────────────────
# Mesmo padrão dos dois irmãos. Pula por completo quando segredo_arn é null
# (smoke test sem cofre real).
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
