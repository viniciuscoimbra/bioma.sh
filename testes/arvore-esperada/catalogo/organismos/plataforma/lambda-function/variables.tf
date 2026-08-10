variable "nome"     { type = string }
variable "ambiente" { type = string }

# o que o provider exige para cada recurso desta receita. Cada um é
# uma peça que se troca: valor vem de fora, nunca fixo na receita.

variable "lambda_function_function_name" {
  type        = string
  description = "function_name de aws_lambda_function (exigido pelo provider)"
}

