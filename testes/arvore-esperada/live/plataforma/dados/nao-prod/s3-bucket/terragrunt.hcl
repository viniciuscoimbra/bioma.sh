# célula: plataforma/dados/nao-prod/s3-bucket
# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a
# parte sua: responda pela tela, ou escreva o valor aqui mesmo.
include "root" {
  path   = find_in_parent_folders("root.hcl")
  expose = true
}

terraform {
  # no live real: git::<catalogo>//organismos/plataforma/dados/s3-bucket?ref=<tag do catalogo.hcl>
  source = "../../../../../catalogo//organismos/plataforma/dados/s3-bucket"
}


inputs = {
  nome     = "s3-bucket"
  ambiente = "nao-prod"
}
