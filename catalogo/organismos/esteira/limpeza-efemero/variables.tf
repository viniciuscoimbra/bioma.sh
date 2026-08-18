variable "ambiente" {
  type        = string
  description = "dev ou hml; a varredura roda dentro de uma única conta, nunca cruza"
}

variable "imagem_inicial" {
  type        = string
  description = "a imagem da função de varredura, por digest (mesma regra de funcao-processadora)"
}

variable "zona_dns_id" {
  type        = string
  description = "zona privada onde ambiente-efemero registra os prefixos, de resolver-dns.zone_ids[<ambiente>]; é a única zona que a varredura pode alterar"
}

variable "ttl_horas" {
  type        = number
  default     = 24
  description = "tempo de inatividade a partir do qual um preview é elegível a destruição, mesmo com PR ainda aberto"
}

variable "agenda" {
  type        = string
  default     = "rate(30 minutes)"
  description = "cadência da varredura; mesmo formato de aws_scheduler_schedule que dlt-inspecao e reconciliacao-ledger já usam"
}

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "kms_key_arn" {
  type    = string
  default = null
}
