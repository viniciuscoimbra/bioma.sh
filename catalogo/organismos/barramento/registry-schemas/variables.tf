variable "plano" { type = string }

# Contas de FORA que leem schema deste registry (o lake, os domínios que
# consomem Avro): elas podem assumir o papel leitor. Vazio significa "só esta
# conta", e aí o papel não nasce.
variable "contas_leitoras" {
  type    = list(string)
  default = []
}
