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

variable "dias_registro_de_acesso" {
  type        = number
  default     = 365
  description = "por quantos dias o registro de acesso a balde sobrevive"

  # Um ano porque investigação de incidente costuma alcançar o exercício
  # anterior. Instituição com retenção regulada maior declara aqui.
}

variable "balde_de_estado" {
  type        = string
  default     = ""
  description = "nome do balde de estado desta conta; vazio desliga a configuração dele"

  # Vazio e não obrigatório porque nem toda instalação guarda estado em S3, e
  # porque a conta que ainda não passou pelo bootstrap não tem o balde: pedir
  # obrigatório faria o piso falhar justamente onde ele precisa rodar primeiro.
}

variable "dias_estado_antigo" {
  type        = number
  default     = 90
  description = "dias até a versão NÃO corrente do estado expirar"

  # Noventa dias, e não trinta: recuperar estado é operação rara e tardia, e o
  # custo de guardar versão de arquivo pequeno por um trimestre é desprezível
  # perto do custo de não ter a versão no dia em que ela salva um import.
}
