variable "nome" {
  type        = string
  description = "nome da função e da agenda. Sem o ambiente dentro: o ambiente já separa as contas, e repeti-lo no nome faz `servico-dev` viver na conta de dev, que é redundância que só aparece quando alguém procura pelo nome errado"
}

variable "ambiente" {
  type        = string
  description = "dev, hml ou prd; nomeia o alias e entra na etiqueta"
}

variable "servico" {
  type        = string
  description = "valor da etiqueta `servico`. Separado de `nome` de propósito: o nome carrega a convenção de nomenclatura da instalação (prefixos, domínio), e a etiqueta é o que a soma de custo por serviço agrupa"
}

variable "imagem_inicial" {
  type        = string
  description = "a imagem por digest com que a função NASCE. Depois do bootstrap quem troca o código é a esteira, por update-function-code, e o `image_uri` está em ignore_changes na molécula: esta variável só vale no CreateFunction"
}

# ── a agenda ────────────────────────────────────────────────────────────────

# SEM DEFAULT, e aqui isso é o contrário do caso do `nome_da_variavel_da_fila`
# do ambiente-efemero-fila: lá a exigência expulsava o caso normal, e aqui ela
# descreve o caso normal. Job de agenda sem agenda não é um job com uma lacuna,
# é outra coisa (e essa outra coisa é a Lambda que só a esteira invoca, que já
# tem receita). Uma cadência plausível seria pior que nenhuma: `rate(1 hour)`
# num job que cobra cliente é uma decisão de negócio tomada por default.
variable "agenda" {
  type        = string
  description = "cadência, no formato de aws_scheduler_schedule (ex.: rate(30 minutes), cron(0 3 * * ? *)); conferir com quem é dono do processo, não supor"
}

variable "estado" {
  type        = string
  default     = "ENABLED"
  description = <<-EOF
    ENABLED, como nas três implementações que esta receita generaliza.

    A tentação é nascer DISABLED, porque a função nasce com a imagem de
    bootstrap e a agenda começaria invocando um placeholder. Não compensa: o
    placeholder retorna e não faz nada, o custo é desprezível, e a invocação
    até prova que o gatilho ligou. O outro lado é pior e é silencioso: agenda
    que nasce desligada depende de alguém lembrar de ligá-la, e job que nunca
    roda não dá erro nenhum, dá ausência.

    DISABLED existe para o caso raro em que rodar antes do código real causa
    dano de verdade (um job que ESCREVE em sistema de terceiro no primeiro
    disparo). A célula que desligar escreve a razão junto, senão ninguém depois
    distingue decisão de esquecimento.
  EOF

  validation {
    condition     = contains(["ENABLED", "DISABLED"], var.estado)
    error_message = "estado aceita apenas ENABLED ou DISABLED."
  }
}

variable "carga" {
  type        = any
  default     = null
  description = "objeto entregue ao handler a cada disparo; nulo omite o atributo e o Scheduler entrega evento vazio, que é o que a maioria dos jobs quer"
}

# ── coordenadas da infra de base ───────────────────────────────────────────

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
  description = "chave do domínio; cifra o registro de log e libera a leitura do cofre cifrado por ela"
}

variable "segredo_arn" {
  type        = string
  default     = null
  description = "ARN do cofre da aplicação; null pula a env var e a policy de leitura"
}

variable "variaveis_de_ambiente" {
  type    = map(string)
  default = {}
}

variable "alarm_actions" {
  type        = list(string)
  default     = []
  description = "para onde vai o alarme de erro da função (tópico da observabilidade do domínio)"
}

# ── porte ──────────────────────────────────────────────────────────────────

variable "memoria_mb" {
  type    = number
  default = 512
}

variable "timeout_s" {
  type        = number
  default     = 300
  description = "cinco minutos: um job faz a passada inteira numa invocação só, e corte por timeout aqui não dá erro claro, dá log que termina sem conclusão"
}
