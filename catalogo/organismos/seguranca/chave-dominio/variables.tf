variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "key_policy_json" {
  type        = string
  description = "a policy da chave; a réplica recebe a própria cópia"
}

variable "regiao_de_consumo" {
  type        = string
  default     = ""
  description = "região onde vive a carga que usa esta chave, quando ela NÃO é a região da primária. Vazio (o normal) faz `key_arn` devolver a primária; preenchido faz devolver a réplica, porque recurso só cifra com o ARN da própria região."
}
