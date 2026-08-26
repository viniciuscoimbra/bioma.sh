variable "route_table_ids" {
  type        = list(string)
  description = "os planos do hub que ganham a saída: uma rota por tabela, e plano fora desta lista continua sem caminho para a internet"
}

variable "attachment_da_inspecao" {
  type = string
  validation {
    condition     = startswith(var.attachment_da_inspecao, "tgw-attach-")
    error_message = "O attachment da VPC de inspeção, vindo do output da célula dela."
  }
}

variable "destino" {
  type        = string
  default     = "0.0.0.0/0"
  description = "a faixa que sai inspecionada; o default é toda a internet, e uma instituição que só libere parte dela declara aqui"
}
