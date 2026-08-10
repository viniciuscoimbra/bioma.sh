variable "nome" { type = string }
variable "key_arn" { type = string }
variable "grantee_principal" { type = string }

variable "operacoes" {
  type    = list(string)
  default = ["Encrypt", "Decrypt", "GenerateDataKey", "DescribeKey"]
}
