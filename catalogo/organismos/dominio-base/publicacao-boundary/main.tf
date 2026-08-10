# Organismo publicacao-boundary: os hormônios do domínio. Tudo que o domínio
# expõe a outros donos vira parâmetro SSM Advanced aqui, compartilhado por RAM
# (ligação boundary-ram) e lido por ARN completo. Nenhum outro caminho de
# descoberta entre domínios é legítimo.

resource "aws_ssm_parameter" "publicacao" {
  for_each = var.publicacoes

  name  = "/dominios/${var.dominio}/${var.ambiente}/${each.key}"
  type  = "String"
  tier  = "Advanced"
  value = each.value
}
