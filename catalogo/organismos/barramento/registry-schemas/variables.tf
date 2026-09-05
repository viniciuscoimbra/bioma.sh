variable "plano" { type = string }

# Contas de FORA que leem schema deste registry (o lake, os domínios que
# consomem Avro). Vazio significa "só esta conta", e aí a resource policy do
# Glue não nasce.
variable "contas_leitoras" {
  type    = list(string)
  default = []
}
