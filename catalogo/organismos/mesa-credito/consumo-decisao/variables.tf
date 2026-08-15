variable "ambiente" { type = string }
variable "pacote_inicial" { type = string }
variable "kms_key_arn" { type = string }
variable "cluster_arn" { type = string }
variable "topicos" { type = list(string) }
variable "motor_arn" { type = string }

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
