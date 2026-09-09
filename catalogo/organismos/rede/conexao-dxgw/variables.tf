variable "nome" {
  type        = string
  description = "o nome da conexão (ex.: rtm); entra em todo recurso desta peça"
}

variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "asn" {
  type = number
  # Sem default, e essa é a lição que criou este organismo: o DXGW do outro
  # lado costuma estar no 64512, que é o default da AWS, e a associação entre
  # dois gateways de mesmo ASN é recusada. Um default aqui repetiria a colisão
  # calada na próxima instalação.
  description = "ASN do lado Amazon deste TGW; tem de diferir do ASN do DXGW do terceiro E do ASN do hub"

  validation {
    condition     = var.asn >= 64512 && var.asn <= 65534
    error_message = "ASN privado de 16 bits (64512-65534)."
  }
}

variable "vpc_id" { type = string }

variable "cidrs_tgw" {
  type        = list(string)
  description = "três /28 dentro da VPC, um por zona, para as sub-redes do attachment desta conexão"

  validation {
    condition     = length(var.cidrs_tgw) == 3
    error_message = "Três faixas, uma por zona: é o mesmo desenho do attachment do hub."
  }
}

variable "route_table_ids" {
  type        = map(string)
  description = "camada -> tabela de rota que recebe a ida; vem de route_table_ids_por_camada da vpc-dominio, nunca de rtb- digitado"
}

variable "destinos" {
  type        = list(string)
  description = "as faixas da rede do outro lado que esta VPC alcança por aqui (a volta chega por BGP)"

  validation {
    condition     = alltrue([for c in var.destinos : can(cidrnetmask(c))])
    error_message = "Cada destino tem de ser um CIDR IPv4."
  }
}
