variable "dominio" { type = string }
variable "ambiente" { type = string }
variable "bucket_gold_arn" { type = string }
variable "kms_key_arn" { type = string }

variable "administradores_arns" {
  type        = list(string)
  description = "quem administra o Lake Formation desta conta (a role da esteira que aplica); sem administrador nenhum grant se concede"
}
