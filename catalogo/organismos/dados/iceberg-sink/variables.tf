variable "plano" { type = string }
variable "plugin_bucket_arn" { type = string }
variable "plugin_s3_key" { type = string }
variable "role_conector_arn" { type = string }
variable "bootstrap_servers" { type = string }
variable "topicos" { type = list(string) }

variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }

variable "max_workers" {
  type    = number
  default = 2
}

variable "config_extra" {
  type    = map(string)
  default = {}
}
