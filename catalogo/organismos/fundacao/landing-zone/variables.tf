# Interface do organismo landing-zone. A pendência 2 do guia da fundação
# (Gruntwork ou schubergphilis) foi resolvida em 2026-08-10 pelo recurso do
# provider; a razão está escrita no `main.tf`.

# a raiz da Organization: a Security OU pende dela por exigência da versão 4.0
# (contas de integração na mesma OU imediatamente abaixo da raiz)
variable "root_id" { type = string }

variable "regiao_residencia" { type = string }
variable "regiao_secundaria" { type = string }
variable "email_audit" { type = string }
variable "email_log_archive" { type = string }

variable "remediation_types" {
  type        = list(string)
  default     = ["INHERITANCE_DRIFT"]
  description = "liga o auto-enrollment; sem isso a sequência inteira quebra em silêncio"
}

variable "retencao_log_dias" { type = number }
