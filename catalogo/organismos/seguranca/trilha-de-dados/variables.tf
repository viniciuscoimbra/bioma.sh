variable "nome" {
  type        = string
  default     = "dados-que-importam"
  description = "nome da trilha"
}

variable "baldes_vigiados" {
  type        = list(string)
  description = "prefixos de nome de balde cujo acesso a objeto vira registro"

  # Sem default, e a lista é curta de propósito.
  #
  # Registro de acesso a objeto é cobrado POR EVENTO, não por balde. Ligar em
  # tudo faz o custo seguir o volume do maior consumidor — num lake, um job que
  # varre partições gera milhões de leituras, e a conta do registro passa a ser
  # maior que a do dado.
  #
  # A escolha é declarar o que importa: onde o acesso indevido é o incidente, e
  # não onde o acesso é o trabalho.
}

variable "balde_destino" {
  type        = string
  description = "balde que recebe a trilha"
}

variable "kms_key_arn" {
  type        = string
  description = "chave que cifra a trilha em repouso"
}

variable "retencao_dias" {
  type    = number
  default = 365
}
