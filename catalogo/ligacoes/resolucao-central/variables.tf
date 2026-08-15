variable "zonas" {
  type        = list(string)
  description = "as zonas privadas dos endpoints compartilhados, já autorizadas pela conta que os hospeda"
}

variable "vpc_id" {
  type = string
  validation {
    condition     = startswith(var.vpc_id, "vpc-")
    error_message = "O identificador da VPC que passa a resolver, vindo do output da célula dela."
  }
}
