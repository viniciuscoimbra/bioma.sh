variable "bordas" {
  type = map(object({
    ip_publico = string
    # ASN do lado de lá; nulo quando o equipamento não fala BGP, e aí as faixas
    # abaixo viram rota escrita à mão no hub.
    asn = optional(number)
    # As faixas da rede corporativa. Com BGP elas são anunciadas e esta lista
    # serve de conferência; sem BGP, ela é a rota.
    faixas = list(string)
  }))
  description = "cada borda física da instituição que termina um túnel"
}

variable "tgw_id" { type = string }

variable "route_table_id" {
  type        = string
  description = "o plano a que a borda se associa; quem decide é a célula"
}

variable "propagar_para" {
  type        = list(string)
  default     = []
  description = "planos que aprendem as faixas desta borda"
}
