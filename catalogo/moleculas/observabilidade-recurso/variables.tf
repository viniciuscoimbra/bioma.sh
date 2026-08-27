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

    # O que fazer quando a métrica para de chegar. Omitido, vale
    # `notBreaching`: ausência de dado é ausência do que o alarme mede. O
    # padrão da AWS é `missing`, que CONGELA o alarme no último estado e o
    # deixa disparado para sempre quando a carga é desligada — medido em conta
    # com o alarme de erro de uma função cujo gatilho foi parado.
    #
    # `breaching` é o valor de quem mede presença: alarme de batimento, em que
    # não chegar dado É o defeito.
    dado_ausente = optional(string, "notBreaching")
  }))
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}
