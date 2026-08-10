variable "attachment_parameter_arn" {
  type = string
  validation {
    condition     = startswith(var.attachment_parameter_arn, "arn:aws:ssm:")
    error_message = "ARN completo do parâmetro do attachment, publicado pelo dono da VPC."
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
