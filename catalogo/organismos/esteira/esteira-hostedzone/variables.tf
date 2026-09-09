variable "contas_confiadas" {
  type        = list(string)
  description = <<-EOF
    ARNs completos das roles que podem assumir esteira-hostedzone (ex.:
    arn:aws:iam::<conta_cb_dev>:role/esteira-dev,
    arn:aws:iam::<conta_cb_hml>:role/esteira-hml). Trust por aws:PrincipalArn,
    não por conta inteira: só a role de execução da esteira, não qualquer
    principal daquela conta.
  EOF

  validation {
    condition     = length(var.contas_confiadas) > 0
    error_message = "contas_confiadas não pode ser vazia: sem ela a role não é assumível por ninguém."
  }
}

variable "zona_ids" {
  type        = list(string)
  description = "Zone IDs das zonas privadas de não-produção que esta role pode escrever (dev.interno, hml.interno — de rede/resolver-dns.zone_ids)"

  validation {
    condition     = length(var.zona_ids) > 0
    error_message = "zona_ids não pode ser vazia: sem ela a policy de permissão não tem Resource."
  }
}
