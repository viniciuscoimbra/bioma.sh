# célula: plataforma/nprd/sqs-queue
# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a
# parte sua: responda pela tela, ou escreva o valor aqui mesmo.
include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  # no live real: git::<catalogo>//organismos/plataforma/sqs-queue?ref=<tag do catalogo.hcl>
  source = "../../../catalogo//organismos/plataforma/sqs-queue"
}

inputs = {
  nome     = "sqs-queue"
  ambiente = "nprd"
}
