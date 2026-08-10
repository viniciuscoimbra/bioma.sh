# Interface do organismo landing-zone. O interior aguarda a decisão do módulo
# vendor (pendência 2 do guia da fundação: Gruntwork terraform-aws-control-tower
# ou schubergphilis mcaf-landing-zone, decidida com um apply de cada em sandbox).
# O recurso cru aws_controltower_landing_zone fica rejeitado (diff perpétuo,
# pré-requisitos, recuperação): módulo mantido, dono único do que a LZ toca.

variable "regiao_residencia" { type = string }
variable "regiao_secundaria" { type = string }
variable "email_audit"       { type = string }
variable "email_log_archive" { type = string }

variable "remediation_types" {
  type        = list(string)
  default     = ["INHERITANCE_DRIFT"]
  description = "liga o auto-enrollment; sem isso a sequência inteira quebra em silêncio"
}

variable "retencao_log_dias" { type = number }
