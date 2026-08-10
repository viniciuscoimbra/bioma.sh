variable "plano" { type = string }
variable "administradores_arns" { type = list(string) }
variable "role_jobs_arn" { type = string }

variable "lf_tags" {
  type    = map(list(string))
  default = { classificacao = ["publico", "interno", "restrito", "pii"] }
}

variable "jobs_silver" {
  type = map(object({
    script_s3 = string
    workers   = number
  }))
  default = {}
}
