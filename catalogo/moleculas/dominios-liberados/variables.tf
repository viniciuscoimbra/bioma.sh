variable "nome" { type = string }
variable "plano" { type = string }

variable "dominios" {
  type        = set(string)
  description = "os domínios liberados na saída; `.exemplo.com` cobre os subdomínios"

  # Sem default. Allowlist que nasce vazia por esquecimento é grupo sem regra
  # nenhuma, e grupo sem regra nenhuma a AWS recusa no apply: o erro aparece
  # depois do plano ter dito que ia dar certo.
  validation {
    condition     = length(var.dominios) > 0
    error_message = "allowlist sem domínio nenhum não existe: declare ao menos um."
  }

  # Curinga não é forma de alvo aqui: o ponto na frente já cobre subdomínio, e
  # `*` passa a impressão de cobrir o que não cobre.
  validation {
    condition = alltrue([
      for d in var.dominios : can(regex("^[.]?([a-z0-9-]+[.])+[a-z]{2,}$", lower(trimspace(d))))
    ])
    error_message = "domínio inválido: use `exemplo.com` para o nome exato ou `.exemplo.com` para ele e os subdomínios, sem curinga e sem esquema."
  }
}

variable "redes_inspecionadas" {
  type        = set(string)
  description = "as faixas cujo tráfego a allowlist avalia: as supernets que chegam pelo hub"

  # Sem default, e a lista vazia reprova: HOME_NET que não cobre a origem faz a
  # allowlist não avaliar nada, e o que não é avaliado cai no default da
  # política. O firewall vira blackhole com aparência de allowlist.
  validation {
    condition     = length(var.redes_inspecionadas) > 0
    error_message = "allowlist de domínio sem rede de origem não avalia nada: declare as supernets que chegam pelo hub."
  }

  validation {
    condition     = alltrue([for c in var.redes_inspecionadas : can(cidrhost(c, 0))])
    error_message = "cada rede inspecionada é um CIDR."
  }
}

variable "cidr_inspecao" {
  type        = string
  default     = "100.64.0.0/21"
  description = "a faixa da VPC de inspeção; casa com a de organismos/rede/inspecao-egress"

  validation {
    condition     = can(cidrhost(var.cidr_inspecao, 0))
    error_message = "cidr_inspecao é um CIDR."
  }
}

variable "tipos_de_alvo" {
  type        = set(string)
  default     = ["TLS_SNI", "HTTP_HOST"]
  description = "onde o firewall procura o nome: SNI do TLS e Host do HTTP em claro"

  validation {
    condition     = length(setsubtract(var.tipos_de_alvo, ["TLS_SNI", "HTTP_HOST"])) == 0
    error_message = "tipo de alvo é TLS_SNI ou HTTP_HOST."
  }

  validation {
    condition     = length(var.tipos_de_alvo) > 0
    error_message = "sem tipo de alvo o grupo não casa nada."
  }
}

variable "capacidade" {
  type        = number
  default     = 100
  description = "unidades de capacidade do grupo, imutáveis depois de criado"

  validation {
    condition     = var.capacidade >= length(var.dominios)
    error_message = "capacidade menor que o número de domínios: o grupo não cabe em si."
  }
}
