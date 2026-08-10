variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "publicacoes" {
  type        = map(string)
  description = "chave relativa -> valor publicado no boundary"
}
