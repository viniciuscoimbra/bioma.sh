variable "repos" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "imagens_retidas" {
  type    = number
  default = 50
}

# Quantos placeholders de bootstrap ficam guardados fora da conta das imagens
# comuns. Baixo de propósito: a tag do placeholder é determinística pelo hash do
# código dele, então existe um por versão do placeholder, e cinco cobrem a
# transição sem virar depósito. Zero desliga a proteção e devolve o placeholder
# à regra de contagem, que é o comportamento de antes.
variable "placeholders_retidos" {
  type    = number
  default = 5
}

variable "org_id" {
  type        = string
  description = "identificador da Organization (o-...), para o aws:SourceOrgID da policy de pull da Lambda"
}

# Regiões para onde o registro replica cada imagem enviada. Vazio mantém o
# registro só na própria região, que é o caso de quem não tem outra.
variable "replicar_para" {
  type    = list(string)
  default = []
}
