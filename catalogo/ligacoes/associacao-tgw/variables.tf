variable "attachment_id" {
  type = string
  validation {
    condition     = startswith(var.attachment_id, "tgw-attach-")
    error_message = "O identificador do attachment, vindo do output da célula da VPC."
  }
}

variable "route_table_id" {
  type        = string
  description = "o plano ao qual o attachment se associa (a decisão em revisão)"
}

variable "propagar_para" {
  type        = list(string)
  description = "route tables que aprendem as rotas deste attachment"
}
