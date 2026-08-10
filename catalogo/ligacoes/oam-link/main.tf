# Ligação oam-link (14): a conta fonte liga no sink da observação. Só existe
# como ligação: o sink é do observabilidade-central, o link é de cada fonte.

resource "aws_oam_link" "este" {
  label_template  = var.rotulo
  resource_types  = var.tipos
  sink_identifier = var.sink_arn
}
