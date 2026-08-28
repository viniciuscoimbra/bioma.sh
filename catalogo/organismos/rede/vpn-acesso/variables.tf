# Sem default, como o par dele (`cidr_clientes`): faixa de rede é decisão de
# quem desenha o endereçamento, e duas instalações que aceitem o mesmo default
# colidem no dia em que se encontrarem por peering ou hub compartilhado. O
# valor anterior (100.64.16.0/24) vive na instância que o escolheu.
variable "cidr_terminacao" { type = string }

variable "cidr_clientes" { type = string }
variable "azs" { type = list(string) }
variable "certificado_arn" {
  type        = string
  description = "certificado de servidor da VPN, no ACM"
}

variable "autenticacao" {
  type    = string
  default = "certificado"
  validation {
    condition     = contains(["certificado", "federada"], var.autenticacao)
    error_message = "autenticacao é `certificado` (sem IdP) ou `federada` (com IdP corporativo)."
  }
  description = "quem autentica a pessoa: a CA de clientes, ou o IdP por SAML"
}

# Duas formas de o IdP chegar aqui, e a árvore prefere a primeira.
#
# `saml_metadata_xml` é o metadata do IdP: com ele, o provedor SAML nasce nesta
# receita, versionado e com dono. `saml_provider_arn` é a porta de trás, para
# quando o provedor já existe fora da árvore — criado à mão ou por outra
# instalação — e só se quer apontar. Recurso de identidade criado à mão é o que
# some do inventário e ninguém sabe quem mexeu, então a porta de trás existe
# por compatibilidade, e não por preferência.
variable "saml_metadata_xml" {
  type        = string
  default     = ""
  description = "metadata SAML do IdP (o XML inteiro); quando vem, o provedor nasce aqui e saml_provider_arn é ignorado"
}

variable "saml_provider_nome" {
  type        = string
  default     = "vpn-acesso"
  description = "nome do provedor SAML criado a partir de saml_metadata_xml"
}

variable "saml_provider_arn" {
  type        = string
  default     = ""
  description = "ARN de um provedor SAML que já existe fora da árvore; ignorado quando saml_metadata_xml vem preenchido"
  validation {
    condition     = var.saml_provider_arn == "" || startswith(var.saml_provider_arn, "arn:aws:iam::")
    error_message = "ARN do provedor SAML, ou vazio quando a autenticação é por certificado."
  }
}

variable "ca_clientes_arn" {
  type        = string
  default     = null
  description = "só quando autenticacao = certificado: a CA que emite o certificado de cada pessoa"
}
variable "log_group" { type = string }

variable "autorizacoes" {
  type        = map(object({ cidr = string, grupo = optional(string) }))
  description = "apelido -> {cidr do domínio (/16), grupo do IdP quando federada}"
}

variable "tgw_id" {
  type        = string
  description = "o hub; sem ele a VPC de terminação não fala com domínio nenhum"
}

variable "plano" {
  type        = string
  default     = "nao-producao"
  description = "o plano de rota do attachment; a associação no hub é da ligação"
}

variable "retencao_log_dias" {
  type    = number
  default = 365
}

variable "kms_key_arn" {
  type        = string
  default     = null
  description = "chave que cifra o registro de conexão; nulo usa a do serviço"
}

variable "supernet" {
  type        = string
  default     = "10.0.0.0/8"
  description = "a faixa que a VPC de terminação alcança pelo hub; mesma escolha do vpc-dominio"
}
