# célula: plataforma/prod/lambda-function
# gerada a partir do desenho; a próxima geração sobrescreve. Os inputs são a
# parte sua: responda pela tela, ou escreva o valor aqui mesmo.
include "root" {
  path   = find_in_parent_folders("root.hcl")
  expose = true
}

terraform {
  # no live real: git::<catalogo>//organismos/plataforma/lambda-function?ref=<tag do catalogo.hcl>
  source = "../../../../catalogo//organismos/plataforma/lambda-function"
}

# a seta do desenho: trilha. É ela que fixa a ordem de criação.
dependency "s3-bucket" {
  config_path = "../../../plataforma/dados/prod/s3-bucket"

  # sem mock, o plano de quem ainda não aplicou a origem para aqui
  mock_outputs = {
    id  = "mock-s3-bucket-id"
    arn = "mock-s3-bucket-arn"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan", "init"]
}


inputs = {
  nome     = "lambda-function"
  ambiente = "prod"
  lambda_function_function_name          = "PREENCHER" # Como esta coisa vai se chamar na AWS
}
