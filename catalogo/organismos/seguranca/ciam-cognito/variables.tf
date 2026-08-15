variable "ambiente" {
  type = string
  validation {
    condition     = contains(["nprd", "prd"], var.ambiente)
    error_message = "CIAM tem dois ambientes, nprd e prd, como toda OU de capacidade."
  }
}

variable "dominio_login" {
  type        = string
  description = "o prefixo do domínio onde o cliente vê a tela de login"
}

variable "callbacks" {
  type        = list(string)
  description = "para onde o canal volta depois do login, um a um"
}

variable "logouts" {
  type        = list(string)
  description = "para onde o canal volta depois da saída, um a um"
}

# ato 2 do rito de descomissionamento (o rito inteiro está em main.tf, junto da
# trava). Existe como variável para que soltar a trava de uma célula não obrigue
# a mexer na receita que todas as células compartilham.
variable "descomissionando" {
  type        = bool
  default     = false
  description = "solta a proteção de exclusão da AWS sem destruir nada; só no descomissionamento"
}
