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
