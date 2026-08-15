variable "ambiente" { type = string }
variable "plugin_bucket_arn" { type = string }
variable "plugin_s3_key" { type = string }
variable "role_conector_arn" { type = string }
variable "bootstrap_servers" { type = string }
variable "tabelas_outbox" { type = string }

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }

variable "config_extra" {
  type    = map(string)
  default = {}
}
