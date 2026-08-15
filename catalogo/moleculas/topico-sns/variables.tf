variable "nome" { type = string }

variable "nome_exibido" {
  type        = string
  description = "o que aparece como remetente na entrega por SMS e por e-mail"
  default     = null
}

variable "kms_key_arn" {
  type        = string
  description = "chave que cifra a mensagem parada no tópico. Chave da instituição é o que permite liberar principal de serviço a publicar; a gerenciada pela AWS não atende esse caso."
}

variable "policy_json" {
  type        = string
  description = "política do tópico, quando alguém de fora da conta precisa publicar. Nulo mantém a política padrão da AWS, que já dá controle ao dono da conta."
  default     = null
}

variable "fifo" {
  type        = bool
  description = "ordem e entrega única. Muda o nome (sufixo .fifo) e restringe o destino a fila SQS FIFO."
  default     = false
}

variable "deduplicacao_por_conteudo" {
  type        = bool
  description = "só no FIFO: o SNS deriva o identificador de duplicata do corpo da mensagem, em vez de exigir que o produtor mande um."
  default     = false
}

variable "assinaturas" {
  type = list(object({
    protocolo = string # sqs, lambda, https, firehose, email, email-json, application
    destino   = string # ARN da fila, da função ou do fluxo; endereço, no caso de e-mail

    # Em SQS e Lambda: entrega a mensagem crua, sem o envelope JSON do SNS.
    mensagem_crua = optional(bool, false)

    # Texto JSON. Filtra por atributo da mensagem; `filtro_escopo = "MessageBody"`
    # muda o alvo para o corpo.
    filtro_json   = optional(string)
    filtro_escopo = optional(string)
  }))

  default = []

  validation {
    condition     = !var.fifo || alltrue([for a in var.assinaturas : a.protocolo == "sqs"])
    error_message = "tópico FIFO só entrega em fila SQS FIFO. Assinatura de outro protocolo é aceita pela API e nunca recebe nada."
  }

  validation {
    condition     = length(distinct([for a in var.assinaturas : "${a.protocolo}:${a.destino}"])) == length(var.assinaturas)
    error_message = "duas assinaturas com o mesmo protocolo e destino. A segunda sobrescreve a primeira na chave e desaparece sem erro."
  }
}
