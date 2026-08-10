variable "blackholes" {
  type        = map(object({ plano = string, cidr = string }))
  default     = {}
  description = "apelido -> {plano, cidr}: a supernet do outro plano morta na tabela"
}
