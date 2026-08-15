variable "ambiente" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_arn" { type = string }
variable "segredo_origem_arn" { type = string }
variable "segredo_destino_arn" { type = string }
variable "role_segredo_arn" { type = string }
variable "mapeamento_tabelas" { type = string }

variable "engine_origem" {
  type    = string
  default = "sqlserver"
}

variable "classe" {
  type    = string
  default = "dms.t3.medium"
}

variable "multi_az" {
  type    = bool
  default = false
}
