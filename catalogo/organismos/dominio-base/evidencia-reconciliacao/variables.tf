variable "prefixo" { type = string }
variable "dominio" { type = string }
variable "ambiente" { type = string }

# Nome do balde que JÁ EXISTE e não pode ser renomeado (object lock em
# COMPLIANCE com versões retidas); vazio compõe o nome com a região.
variable "nome_legado" {
  type    = string
  default = ""
}
variable "kms_key_arn" { type = string }

variable "retencao_dias" {
  type    = number
  default = 1825
}

variable "dias_versao_antiga" {
  type    = number
  default = 90

  description = "por quantos dias a versão anterior de um objeto sobrevive"

  # Noventa dias porque recuperação de engano costuma ser pedida em semanas, e
  # não em anos. Instituição com retenção regulada maior declara aqui, e a
  # decisão fica no diff.
}
