variable "plano" { type = string }

# Contas de FORA que leem schema deste registry (o lake, os domínios que
# consomem Avro): elas podem assumir o papel leitor. Vazio significa "só esta
# conta", e aí o papel não nasce.
# Quem pode assumir o papel leitor do registry. Cada item é o id de uma conta
# (vira `arn:aws:iam::<id>:root`) ou um ARN de principal já pronto, que entra
# como está. Conta inteira serve a quem esta árvore governa; leitor de fora da
# organização entra pelo ARN da role dele.
variable "contas_leitoras" {
  type    = list(string)
  default = []
}

# Contas de FORA que registram versão de schema (o produtor Avro com
# auto-registro, como o CDC do livro): podem assumir o papel escritor. Vazio
# significa "só a esteira registra", e o papel não nasce.
variable "contas_escritoras" {
  type    = list(string)
  default = []
}
