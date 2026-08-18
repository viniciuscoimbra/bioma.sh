variable "root_id" { type = string }

variable "standards_arns" {
  type        = list(string)
  description = "standards habilitados no piso (ex.: AWS Foundational Security Best Practices)"
}

variable "controles_desligados" {
  type        = list(string)
  default     = []
  description = "controles do Security Hub que esta instituição desliga; vazio é o piso, com todos ligados"

  # Vazio de propósito. A alternativa não é "menos controle", é controle
  # desligado sem ninguém saber qual: a API exige a lista, e escrevê-la vazia
  # deixa dito que o piso é todo o standard.
}
