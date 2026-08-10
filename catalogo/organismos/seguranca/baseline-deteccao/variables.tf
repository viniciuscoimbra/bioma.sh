variable "root_id" { type = string }

variable "standards_arns" {
  type        = list(string)
  description = "standards habilitados no piso (ex.: AWS Foundational Security Best Practices)"
}
