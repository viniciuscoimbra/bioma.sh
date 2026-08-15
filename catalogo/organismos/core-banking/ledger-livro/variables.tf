variable "ambiente" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }
variable "kms_key_arn" { type = string }

variable "instancias" {
  type    = number
  default = 2
}

variable "classe" {
  type    = string
  default = "db.r6g.large"
}
