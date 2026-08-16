variable "dev" { type = string }

variable "ami" {
  type        = string
  description = "a imagem, escolhida e registrada por quem desenha; nunca resolvida em tempo de apply"
  validation {
    condition     = startswith(var.ami, "ami-")
    error_message = "Identificador de imagem (ami-...)."
  }
}
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

variable "kms_sessao_ssm_arn" {
  type        = string
  default     = null
  description = "a chave que cifra a sessão do Session Manager; nulo quando a sessão não é cifrada por chave da instituição"
}

variable "politicas_gerenciadas" {
  type        = list(string)
  default     = []
  description = "políticas que a role da máquina anexa além do SSM básico; a gravação da sessão entra por aqui"
}

variable "etiquetas" {
  type        = map(string)
  default     = {}
  description = "etiquetas da máquina; é por elas que as políticas de acesso a escolhem"
}
