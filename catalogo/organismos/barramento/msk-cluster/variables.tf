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
