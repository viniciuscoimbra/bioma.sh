variable "fonte" { type = string }
variable "ambiente" { type = string }
variable "imagem_inicial" { type = string }
variable "kms_key_arn" { type = string }

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
