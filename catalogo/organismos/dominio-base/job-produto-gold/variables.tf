variable "dominio" { type = string }
variable "role_jobs_arn" { type = string }
variable "database_gold" { type = string }
variable "bucket_gold" { type = string }

variable "jobs" {
  type = map(object({
    script_s3 = string
    workers   = number
  }))
  default = {}
}
