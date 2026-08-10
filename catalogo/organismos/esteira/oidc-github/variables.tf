variable "conta_alvo" { type = string }

variable "repos_permitidos" {
  type        = list(string)
  description = "org/repo:ref (ex.: <org>/<repo>-live:ref:refs/heads/main)"
}

variable "policy_apply_json" {
  type        = string
  description = "o que a esteira deste trilho pode tocar; mínimo, por PR"
}
