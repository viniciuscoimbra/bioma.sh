variable "consumidor" { type = string }
variable "plano" { type = string }
variable "kms_key_arn" { type = string }

variable "roles_acesso_lake" {
  type        = list(string)
  default     = []
  description = "roles além da role de lake que a receita cria (integrações do consumidor); a de lake é a default do namespace"
}

variable "recursos_do_catalogo" {
  type        = list(string)
  description = "catálogo, bancos e tabelas que a role de lake lê nesta conta; os produtos de outros domínios chegam por resource link"
}

variable "rpu_base" {
  type    = number
  default = 8
}

variable "rpu_teto" {
  type    = number
  default = 32
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
