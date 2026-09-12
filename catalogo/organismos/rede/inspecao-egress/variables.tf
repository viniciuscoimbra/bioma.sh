variable "plano" { type = string }

# Sem default: faixa de rede é decisão de quem desenha o endereçamento, e o
# valor precisa ser o MESMO que a molécula dominios-liberados recebe. Default
# nos dois lados esconde a concordância exigida, e o dia em que um mudar o
# outro segue com o antigo sem nada acusar.
variable "cidr_inspecao" { type = string }

# Quantas zonas, e quais. O número é o da lista, e não três fixos: endpoint de
# firewall é zonal e é o item caro desta topologia, então um plano que tolera
# perder uma zona paga por uma só. Produção declara as três e nada muda para
# ela; não-produção declara uma e a conta cai a um terço.
#
# O teto é três porque a faixa já está repartida: os blocos de três bits 0 a 2
# são do firewall e 3 a 5 do NAT. Com uma quarta zona o firewall pediria o
# bloco 3, que é o primeiro do NAT, e o apply morreria em CIDR sobreposto
# depois de o plano ter dito que ia dar certo.
variable "azs" {
  type = list(string)

  validation {
    condition     = length(var.azs) >= 1 && length(var.azs) <= 3
    error_message = "de uma a três zonas: a repartição da faixa não comporta a quarta."
  }

  validation {
    condition     = length(distinct(var.azs)) == length(var.azs)
    error_message = "zona repetida: o firewall publica um endpoint por zona, e a segunda sub-rede da mesma zona nasce sem endpoint para apontar."
  }
}
variable "tgw_id" {
  type = string
  validation {
    condition     = startswith(var.tgw_id, "tgw-")
    error_message = "O identificador do Transit Gateway, vindo do output do hub."
  }
}

variable "postura_default" {
  type        = string
  default     = "drop"
  description = "o que o motor stateful faz com o que nenhuma regra casou: drop ou allow"

  # O padrão é `drop` porque errar para o lado de bloquear é recuperável e
  # errar para o lado de liberar não. Quem precisa de `allow` declara, e a
  # declaração fica no diff.
  validation {
    condition     = contains(["drop", "allow"], var.postura_default)
    error_message = "postura_default é drop ou allow."
  }
}

variable "bloqueio" {
  type        = string
  default     = "conexao"
  description = "onde o drop default morde: conexao (o que já estabeleceu) ou pacote (todo pacote)"

  # `conexao` é o default porque a allowlist desta topologia é por domínio, e
  # ler o nome exige a conexão de pé: o SNI chega no ClientHello, depois do
  # handshake. Com `pacote` o handshake morre antes e a allowlist nunca casa,
  # sem erro nenhum no plano nem no apply. Quem usa só regra de porta pode
  # apertar para `pacote`, e a declaração fica no diff.
  validation {
    condition     = contains(["conexao", "pacote"], var.bloqueio)
    error_message = "bloqueio é conexao ou pacote."
  }
}

variable "grupos_de_regra_arns" {
  type        = list(string)
  default     = []
  description = "regras stateful; a política de egress é decisão de segurança, por PR"
}

variable "supernet_interna" {
  type        = string
  description = "a faixa que volta para o hub depois da inspeção"

  # 10/8 inteiro: as quatro supernets do plano de endereçamento cabem dentro
  # dele, e a rota de volta não precisa mudar a cada ambiente novo.
  default = "10.0.0.0/8"
}
