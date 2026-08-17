variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "prefixo" {
  type        = string
  description = "prefixo dos nomes globais da instituição; nome de balde é global na AWS"
}

variable "kms_key_arn" {
  type        = string
  description = "a chave que cifra a gravação e o log"
}

# Quem entra é decidido pela etiqueta da máquina, e não por uma lista de
# identificadores: máquina nova nasce alcançável ou não pela própria receita
# dela, sem ninguém lembrar de atualizar política.
variable "etiqueta" {
  type    = string
  default = "SSMAcesso"
}

variable "circulos" {
  type        = map(list(string))
  description = "nome do círculo -> valores da etiqueta que ele alcança; um por perfil de acesso"
}

variable "retencao_dias" {
  type    = number
  default = 365
  validation {
    condition     = var.retencao_dias >= 90
    error_message = "Gravação de acesso guarda por 90 dias no mínimo: é prova, e auditoria não pergunta na semana seguinte."
  }
}

variable "minutos_ocioso" {
  type        = number
  default     = 20
  description = "sessão parada se encerra sozinha; terminal esquecido aberto é acesso sem dono"
  validation {
    condition     = var.minutos_ocioso >= 1 && var.minutos_ocioso <= 60
    error_message = "Entre 1 e 60 minutos, que é o que o Session Manager aceita."
  }
}

variable "nomes_dos_circulos" {
  type        = map(string)
  default     = {}
  description = "nome explícito por círculo; serve à migração de nome sem janela aberta"
}
