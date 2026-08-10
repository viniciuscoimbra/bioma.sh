variable "nome_recurso" { type = string }

variable "alarmes" {
  type = map(object({
    namespace   = string
    metrica     = string
    estatistica = string
    operador    = string
    limiar      = number
    avaliacoes  = number
    periodo_s   = number
    dimensoes   = map(string)
  }))
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}
