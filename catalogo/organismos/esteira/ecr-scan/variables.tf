variable "repos" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "imagens_retidas" {
  type    = number
  default = 50
}

variable "org_id" {
  type        = string
  description = "identificador da Organization (o-...), para o aws:SourceOrgID da policy de pull da Lambda"
}
