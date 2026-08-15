variable "dominio" { type = string }
variable "regiao" { type = string }

variable "ambiente" {
  type = string
  # O vocabulário de ambiente é da instituição, e quem confere se o ambiente
  # existe é convencoes.json. Aqui sobra a forma, porque o valor entra em nome
  # de recurso e em caminho de parâmetro. A coerência com o IPAM não precisa de
  # lista: as chaves de pool_ids são os mesmos nomes, e ambiente sem pool
  # falha na alocação, nomeando o que faltou.
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.ambiente))
    error_message = "Ambiente em minúsculas, começando por letra: ele entra em nome de recurso."
  }
}

variable "ipam_pool_id" {
  type        = string
  description = "pool do ambiente no IPAM; CIDR nunca escolhido à mão (02.2 §3)"
}

variable "netmask" {
  type    = number
  default = 16

  validation {
    # o mesmo piso de cidrs_permitidos: uma VPC mais larga que /16 publicaria
    # um cidr_block que a VPC par é obrigada a recusar, e ninguém a alcançaria
    condition     = var.netmask >= 16
    error_message = "A VPC é /16 ou mais específica (02.2 §3): é a alocação do IPAM e o piso que o par aceita declarar."
  }
}

variable "tgw_id" {
  type = string
  # Pela dependência, e não por consulta ao SSM: mock que alimenta `data` vira
  # chamada à nuvem com valor inventado, no plano. O hormônio publicado pelo
  # hub continua existindo, para quem lê em runtime.
  validation {
    condition     = startswith(var.tgw_id, "tgw-")
    error_message = "O identificador do Transit Gateway, vindo do output do hub."
  }
}

variable "cidrs_permitidos" {
  type        = list(string)
  default     = []
  description = "quem entra nas cargas desta VPC vindo de fora dela: o CIDR de cada VPC par, ligado ao output cidr_block dela na célula, um por vez (02·D5)"

  validation {
    condition     = alltrue([for c in var.cidrs_permitidos : can(cidrnetmask(c))])
    error_message = "Cada entrada de cidrs_permitidos tem que ser um CIDR IPv4 (ex.: 10.1.0.0/16)."
  }

  validation {
    # /16 é o que o IPAM aloca por VPC (02.2 §3), e o piso vale para toda
    # entrada, não só para 10.0.0.0/8. Limitar o piso ao 10/8 deixaria passar
    # 0.0.0.0/0 e 128.0.0.0/1, que abrem a VPC ao mundo pela porta de exceção
    # aberta para fornecedor e Client VPN. Faixa externa legítima é miúda: a
    # terminação da Client VPN é /22.
    condition = alltrue([
      for c in var.cidrs_permitidos :
      try(tonumber(split("/", c)[1]) >= 16, false)
    ])
    error_message = "Todo CIDR declarado tem que ser /16 ou mais específico: /16 é a alocação do IPAM por VPC, e prefixo mais curto abre supernet (ou, fora de 10.0.0.0/8, a internet)."
  }
}

variable "regras_dns_ids" {
  type        = list(string)
  default     = []
  description = "regras de encaminhamento compartilhadas pela conta de rede, associadas a esta VPC"
}

# O layout da VPC, declarado por quem opera o domínio. Sem default: três
# sub-redes iguais servem a nenhuma carga real, e escolher o layout por conta
# do catálogo é decidir no lugar de quem conhece a carga.
variable "camadas" {
  type = map(object({
    prefixo_bits = number
    indices      = list(number)
    rota_default = bool
    etiquetas    = optional(map(string), {})
  }))

  validation {
    condition     = length(var.camadas) > 0
    error_message = "Declare ao menos uma camada: a VPC sem sub-rede não hospeda nada."
  }

  validation {
    condition     = alltrue([for c in var.camadas : length(c.indices) == 3])
    error_message = "Cada camada ocupa três blocos, um por zona."
  }
}

# A camada onde nascem os endpoints de interface desta VPC.
variable "camada_dos_endpoints" {
  type        = string
  description = "nome da camada que hospeda os endpoints de interface"
}

# As sub-redes do attachment do hub, separadas das camadas de carga: trocar a
# camada de uma carga não pode arrastar o attachment junto. /28 é o que a AWS
# recomenda para attachment.
variable "bits_tgw" {
  type    = number
  default = 12
}

variable "indices_tgw" {
  type    = list(number)
  default = [4093, 4094, 4095]
  validation {
    condition     = length(var.indices_tgw) == 3
    error_message = "Três blocos, um por zona."
  }
}
