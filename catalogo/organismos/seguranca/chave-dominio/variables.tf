variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "key_policy_json" {
  type        = string
  description = "a policy da chave; a réplica recebe a própria cópia"
}
