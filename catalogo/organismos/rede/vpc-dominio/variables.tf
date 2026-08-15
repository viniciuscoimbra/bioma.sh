variable "dominio" { type = string }
variable "regiao" { type = string }

variable "ambiente" {
  type = string
  # O vocabulário de ambiente é da instituição, e não do catálogo: quem desenha
  # declara os ambientes que existem, como declara os domínios. Uma lista fixa
  # aqui recusava `hml` numa árvore que usa `hml`, e a mensagem culpava o nome
  # certo. Quem confere se o ambiente existe é `convencoes.json`.
  #
  # O que sobra de validação é forma, e ela existe porque este valor entra em
  # nome de recurso e em caminho de parâmetro.
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.ambiente))
    error_message = "Ambiente em minúsculas, começando por letra: ele entra em nome de recurso."
  }
}

variable "ipam_pool_id" {
  type        = string
  description = "pool do ambiente no IPAM; CIDR nunca escolhido à mão (02.2 §3)"
}

variable "netmask" {
  type    = number
  default = 16
}

# De onde o hormônio do hub é lido. Nenhum dos dois vem da célula que o publica,
# e por isso nenhum precisa de mock.
variable "conta_rede" {
  type        = string
  description = "a conta que hospeda o Transit Gateway e publica o identificador dele"
  validation {
    condition     = can(regex("^[0-9]{12}$", var.conta_rede))
    error_message = "Número de conta AWS: 12 dígitos."
  }
}
