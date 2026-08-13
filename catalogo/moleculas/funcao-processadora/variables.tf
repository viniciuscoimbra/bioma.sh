variable "nome" { type = string }
variable "imagem_inicial" {
  type        = string
  description = "URI da imagem de bootstrap no ECR, por digest; a esteira governa as seguintes"
}

variable "memoria_mb" {
  type    = number
  default = 512
}

variable "timeout_s" {
  type    = number
  default = 60
}

variable "retencao_log_dias" {
  type    = number
  default = 30
}

variable "kms_key_arn" {
  type    = string
  default = null
}

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}
