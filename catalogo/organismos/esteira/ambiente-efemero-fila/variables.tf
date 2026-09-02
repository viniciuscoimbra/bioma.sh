# ── identidade do efêmero ──────────────────────────────────────────────────

variable "prefixo" {
  type        = string
  description = "identificador do ambiente: pr-123 no preview, rc-45 na homologação"

  validation {
    # Aqui o prefixo não entra em rótulo DNS (esta receita não escreve DNS),
    # mas entra em nome de fila e de função. A regra continua a mesma do irmão
    # síncrono de propósito: o mesmo prefixo nomeia os dois, e uma regra por
    # receita faria o mesmo PR ser aceito num e recusado no outro.
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$", var.prefixo))
    error_message = "prefixo deve ser um rótulo em minúsculas (ex.: pr-123, rc-45), até 40 caracteres."
  }
}

variable "tipo" {
  type        = string
  description = "preview (por PR, na conta dev) ou homologacao (por candidato, na conta hml)"

  validation {
    condition     = contains(["preview", "homologacao"], var.tipo)
    error_message = "tipo aceita apenas preview ou homologacao."
  }
}

variable "servico" {
  type        = string
  description = "nome do serviço a que este ambiente pertence, usado na composição dos nomes"
}

# ── o artefato ─────────────────────────────────────────────────────────────
# Mesma regra do irmão síncrono (15·D6, 15·D7): imagem por digest, publicada
# pelo build no ECR. O efêmero não inventa um segundo caminho de empacotamento
# que dev e prd não têm.

variable "referencia_artefato" {
  type        = string
  description = "a imagem por digest (repo@sha256:...), publicada pelo build no ECR"
}

# ── coordenadas da infra de base ───────────────────────────────────────────
# Nada aqui é criado por esta receita: vem por dependency das células de base
# da mesma conta, ou por SSM quando a leitura cruza conta (o caso do KMS).

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "kms_key_arn" {
  type        = string
  default     = null
  description = "chave do domínio, por SSM da conta de segurança; cifra o log group e a fila. Nula deixa a fila com a cifra gerenciada do SQS, que é o default do serviço e não custa chave"
}

variable "segredo_arn" {
  type        = string
  default     = null
  description = "ARN do segredo da aplicação (dominio-base/segredo-servico), para a policy de leitura; null pula a policy (útil para smoke test sem conexão real a banco/fontes)"
}

variable "variaveis_de_ambiente" {
  type        = map(string)
  default     = {}
  description = "env vars extras da aplicação (ex.: DOTNET_ENVIRONMENT), mescladas com a do segredo e com a da fila"
}

variable "chave_do_registro_arn" {
  type        = string
  default     = null
  description = "a chave que cifra o registro de imagem, para a função decifrar a camada no pull. Número de conta e região não moram na receita: o valor vem de quem dispara. Nulo quando o registro não tem chave própria, e a permissão não nasce."
}

# ── porte e retenção ───────────────────────────────────────────────────────

variable "memoria_mb" {
  type    = number
  default = 512
}

variable "timeout_s" {
  type    = number
  default = 60
}

variable "retencao_log_dias" {
  type        = number
  default     = 7
  description = "curto de propósito: o ambiente morre com o PR, o log não deve sobreviver muito a ele"
}

# ── a fila ─────────────────────────────────────────────────────────────────

# SEM DEFAULT, e isso é a decisão: o nome desta env var é o que a APLICAÇÃO lê,
# e só quem tem o código do serviço na mão sabe qual é. Um default plausível
# seria pior que nenhum, porque a falha dele é silenciosa: a função sobe
# saudável, o mapeamento fica ativo, a fila enche, e a aplicação procura a URL
# numa chave que ninguém preencheu. Sem valor, o apply para e pergunta.
#
# A env var do segredo, ali em cima, é literal na receita porque foi conferida
# no Program.cs do serviço piloto. Esta não foi conferida em serviço nenhum, e
# fingir que foi é o que se está recusando aqui.
#
# `null` é resposta, não omissão: nullable já vale true por padrão do
# Terraform (sem precisar declarar), então a instância pode passar
# `nome_da_variavel_da_fila = null` explicitamente — e isso ainda satisfaz a
# exigência de valor (omitir a variável continua parando o apply). É o que um
# consumer por Event Source Mapping puro precisa: a URL da fila nunca é lida
# pela aplicação (sem cliente SQS ativo no código; quem faz o poll é o
# serviço da Lambda) — achado real em futuro-core-bancario-notificacao-
# consumer, 2026-09-02, conferido no handler e na infra de referência do
# próprio time. main.tf trata `null` como "não injeta esta env var", igual já
# faz com segredo_arn.
variable "nome_da_variavel_da_fila" {
  type        = string
  description = "como a aplicação chama a env var em que recebe a URL da fila (ex.: Fila__Url); conferir no código do serviço, não supor. null quando a aplicação não lê a própria URL de fila (consumer por Event Source Mapping puro, sem cliente SQS ativo) — decisão explícita, não default."
}

variable "tamanho_do_lote" {
  type        = number
  default     = 10
  description = "quantas mensagens o Event Source Mapping entrega por invocação"
}

variable "tentativas_antes_da_dlt" {
  type        = number
  default     = 3
  description = <<-EOF
    quantas vezes a mesma mensagem volta antes de ir para a fila de descarte.
    Baixo de propósito: no efêmero, mensagem que não processa é defeito do
    código em revisão, e o valor de um preview é o defeito aparecer rápido na
    fila de descarte, não a mensagem circular até o PR fechar.
  EOF
}

variable "retencao_mensagem_s" {
  type        = number
  default     = 86400
  description = "um dia: o ambiente morre com o PR, e mensagem que sobrevive a ele não tem quem a leia"
}
