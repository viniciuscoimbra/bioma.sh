variable "ambiente" { type = string }
variable "versao_modelo" { type = string }
variable "imagem_inferencia" { type = string }
variable "modelo_s3_url" { type = string }
variable "bucket_modelos_arn" { type = string }
variable "kms_key_arn" { type = string }

variable "instancia" {
  type    = string
  default = "ml.m5.large"
}

variable "replicas" {
  type    = number
  default = 1
}

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
