variable "prefixo" { type = string }
variable "consumidor" { type = string }
variable "plano" { type = string }

variable "teto_bytes_por_consulta" {
  type    = number
  default = 107374182400 # 100 GiB: FinOps por workgroup
}
