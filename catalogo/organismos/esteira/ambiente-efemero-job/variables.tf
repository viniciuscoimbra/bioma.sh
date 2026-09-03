# ── identidade do efêmero ──────────────────────────────────────────────────

variable "prefixo" {
  type        = string
  description = "identificador do ambiente: pr-123 no preview, rc-45 na homologação"

  validation {
    # Aqui o prefixo não entra em rótulo DNS (esta receita não escreve DNS),
    # mas entra em nome de função. A regra continua a mesma dos dois irmãos de
    # propósito: o mesmo prefixo nomeia os três, e uma regra por receita faria
    # o mesmo PR ser aceito num e recusado no outro.
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
# Mesma regra dos irmãos (15·D6, 15·D7): imagem por digest, publicada pelo
# build no ECR. O efêmero não inventa um segundo caminho de empacotamento que
# dev e prd não têm.

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
  description = "chave do domínio, por SSM da conta de segurança; cifra o log group. Nula deixa o log com a chave gerenciada da AWS"
}

variable "segredo_arn" {
  type        = string
  default     = null
  description = "ARN do segredo da aplicação (dominio-base/segredo-servico), para a policy de leitura; null pula a policy (útil para smoke test sem conexão real a banco/fontes)"
}

variable "variaveis_de_ambiente" {
  type        = map(string)
  default     = {}
  description = "env vars extras da aplicação (ex.: DOTNET_ENVIRONMENT), mescladas com a do segredo"
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
  type        = number
  default     = 300
  description = <<-EOF
    Cinco minutos, e não os sessenta segundos do irmão de fila. A diferença é
    de forma, não de gosto: uma função de fila é dimensionada para UMA
    mensagem, e o lote reparte o trabalho; um job faz a passada inteira numa
    invocação só, e no preview a passada costuma ser sobre a base de dev
    inteira. Timeout curto demais aqui não dá erro claro, dá corte no meio, com
    o log terminando sem conclusão nenhuma.
  EOF
}

variable "retencao_log_dias" {
  type        = number
  default     = 7
  description = "curto de propósito: o ambiente morre com o PR, o log não deve sobreviver muito a ele"
}
