variable "nome" { type = string }
variable "plano" { type = string }

variable "versao_kafka" {
  type    = string
  default = "3.7.x"
  validation {
    condition     = !startswith(var.versao_kafka, "2.6") && !startswith(var.versao_kafka, "2.5")
    error_message = "Multi-VPC connectivity exige Kafka >= 2.7.1."
  }
}

variable "tipo_broker" {
  type    = string
  default = "kafka.m7g.large"
}

variable "storage_gb" {
  type    = number
  default = 500
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "brokers" {
  type        = number
  description = "nós do cluster; múltiplo do número de zonas"

  # Seis em produção, dois por zona: é o piso que a AWS recomenda para carga de
  # produção, e o que sustenta `min.insync.replicas = 2` quando um broker cai
  # durante manutenção. Com três, um por zona, a perda de um broker deixa a
  # partição sem o segundo réplica em sincronia e a escrita para.
  #
  # Não-produção usa três, um por zona: prova o comportamento distribuído sem
  # pagar o dobro.
  default = 6

  validation {
    condition     = var.brokers % 3 == 0 && var.brokers >= 3
    error_message = "brokers é múltiplo de 3 (uma zona por vez), e no mínimo 3."
  }
}

variable "log_broker" {
  type        = bool
  default     = true
  description = "log do broker em grupo de log da conta; a subscrição o leva para a camada raw"

  # Nasce ligado porque a AWS o entrega desligado, e barramento sem trilha é a
  # peça mais central da arquitetura sem prova de quem publicou o quê. Quem tem
  # motivo para desligar declara, e a declaração fica no diff.
}

variable "dias_de_log" {
  type        = number
  default     = 30
  description = "retenção do grupo de log do broker; a retenção longa é do lake, não daqui"

  validation {
    condition     = var.dias_de_log >= 1
    error_message = "retenção em dias é um número positivo."
  }
}

variable "metrica_aberta" {
  type        = bool
  default     = true
  description = "exportadores JMX e de nó do broker, para lag por partição"
}
