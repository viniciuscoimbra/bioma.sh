variable "prefixo" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "object_lock_bronze" {
  type    = bool
  default = false
}

variable "retencao_lock_dias" {
  type    = number
  default = 1825 # 5 anos, régua regulatória; confirmar por classe de dado
}

variable "dias_para_frio" {
  type    = number
  default = 90
}

variable "principais_de_escrita" {
  type        = list(string)
  description = "ARNs das roles que tocam o dado direto no S3: a role dos jobs, a role do conector e a role de registro do Lake Formation. Todo o resto é negado pela política de bucket e só lê pelo Lake Formation."
  validation {
    condition     = length(var.principais_de_escrita) > 0
    error_message = "Sem role de escrita o lake nasce fechado para o próprio trilho: nem o conector nem os jobs alcançam o dado."
  }
}

variable "excecoes_arns" {
  type        = list(string)
  default     = []
  description = "ARNs que atravessam o deny de acesso direto além do trilho (operação assistida, migração). Vazio por padrão, e cada entrada aparece no diff."
}
