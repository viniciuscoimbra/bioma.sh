variable "plano" { type = string }
variable "imagem" { type = string }
variable "regiao" { type = string }

variable "cpu" {
  type    = string
  default = "1024"
}

variable "memoria" {
  type    = string
  default = "4096"
}

variable "replicas" {
  type    = number
  default = 1
}

variable "execution_role_arn" { type = string }
variable "task_role_arn" { type = string }
variable "log_group" { type = string }
variable "subnet_ids" { type = list(string) }
variable "security_group_ids" { type = list(string) }

variable "ambiente" {
  type    = map(string)
  default = {}
}
