variable "email_seguranca" {
  type        = string
  default     = ""
  description = "o endereço que recebe aviso de segurança desta conta"
}

variable "nome_contato_seguranca" {
  type    = string
  default = "Seguranca da Informacao"
}

variable "telefone_contato_seguranca" {
  type        = string
  default     = ""
  description = "telefone do contato de segurança; vazio faz o contato não nascer, e Account.1 reprovar com razão"
}




variable "senha_tamanho_minimo" {
  type    = number
  default = 14

  # Quatorze é o que o CIS cobra. Menos que isso reprova o controle, e o
  # número está aqui para que baixá-lo seja decisão visível, não descuido.
}

variable "senha_reuso_proibido" {
  type    = number
  default = 24
}

variable "senha_validade_dias" {
  type    = number
  default = 90
}

variable "bloqueio_de_gateway" {
  type    = string
  default = "block-bidirectional"

  description = "quanto do tráfego de internet gateway a conta bloqueia: block-bidirectional (padrão) ou block-ingress"

  # `block-bidirectional` é o padrão porque a maioria das contas não tem
  # gateway nenhum, e nelas a diferença é entre proibir e proibir mais. A
  # exceção é a conta que hospeda a saída da organização: ali, o padrão
  # derrubaria o egresso de todo mundo.
  validation {
    condition     = contains(["block-bidirectional", "block-ingress", "off"], var.bloqueio_de_gateway)
    error_message = "bloqueio_de_gateway aceita block-bidirectional, block-ingress ou off."
  }
}
