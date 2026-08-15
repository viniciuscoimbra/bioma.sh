variable "ambiente" { type = string }
variable "definicao_asl" { type = string }
variable "score_endpoint_arn" { type = string }
variable "kms_key_arn" { type = string }

variable "funcoes_passos_arns" {
  type    = list(string)
  default = ["*"]
}
