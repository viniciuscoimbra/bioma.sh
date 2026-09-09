variable "zona_dns_nome" {
  type        = string
  description = "a zona privada deste ambiente (ex.: dev.interno); o wildcard cobre *.<zona>, mesmo nome que resolver-dns publica e ambiente-efemero consome"
}

variable "ca_privada_arn" {
  type        = string
  description = "ARN da CA compartilhada por RAM (organismos/rede/ca-privada, na conta network); esta conta precisa estar entre os principals daquela CA"
}
