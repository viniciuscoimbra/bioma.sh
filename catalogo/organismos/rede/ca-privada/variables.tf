variable "dominio_raiz" {
  type        = string
  description = "CN da CA raiz (ex.: interno.<sua-instituicao>); não é o domínio do wildcard em si, é o nome da autoridade"
}

variable "principals" {
  type        = list(string)
  description = "ARNs de OU (preferido) ou de conta que podem pedir certificado a esta CA — mesma escolha de ligacoes/boundary-ram: OU inteira, não conta a conta"
}
