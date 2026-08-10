variable "dev" { type = string }
variable "vpc_id" { type = string }
variable "subnet_id" { type = string }
variable "kms_key_arn" { type = string }

variable "tamanho" {
  type    = string
  default = "t4g.large"
}

variable "disco_gb" {
  type    = number
  default = 100
}

variable "ttl" {
  type        = string
  default     = "30d-sem-uso"
  description = "varredura desliga workspace parado; recriar é barato, o código está no remoto"
}
