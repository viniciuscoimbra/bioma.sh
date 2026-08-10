variable "dominio" { type = string }

variable "regras" {
  type = map(object({
    database = string
    tabela   = string
    dqdl     = string # ex.: "Rules = [ RowCount > 0, IsComplete \"id\" ]"
  }))
}
