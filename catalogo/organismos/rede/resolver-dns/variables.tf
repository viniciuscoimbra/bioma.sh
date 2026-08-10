variable "plano" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

variable "cidr_permitido" {
  type        = string
  description = "de onde as consultas chegam (a supernet do plano)"
}

variable "zonas" {
  type        = list(string)
  description = "zonas privadas por ambiente (ex.: dev.interno, hml.interno)"
}
