variable "repos" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "imagens_retidas" {
  type    = number
  default = 50
}
