variable "conta_plataforma" { type = string }
variable "regiao" { type = string }

variable "plano" {
  type = string
  # Mesmo motivo do ambiente: o vocabulário é da instituição. Esta lista dizia
  # `producao` e `nao-producao` enquanto a árvore de uma instalação real usava
  # `prd` e `nprd`, e a recusa culpava o nome certo. A lista de planos vive em
  # `convencoes.json`, sob a natureza de capacidade.
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.plano))
    error_message = "Plano em minúsculas, começando por letra: ele entra em nome de recurso."
  }
}

variable "ipam_pool_id" { type = string }
variable "tgw_id_parameter_arn" { type = string }

variable "netmask" {
  type    = number
  default = 16
}
