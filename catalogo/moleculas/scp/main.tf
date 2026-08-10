# Molécula scp: a política e os attachments dela. Teto do Control Tower: 10 por
# OU, contando FullAWSAccess e os controles gerenciados; não projetar para 10.
# plan não prova que a SCP não bloqueia serviço crítico: canário antes (guia §5).

resource "aws_organizations_policy" "esta" {
  name        = var.nome
  description = var.descricao
  type        = "SERVICE_CONTROL_POLICY"
  content     = var.policy_json
}

resource "aws_organizations_policy_attachment" "alvos" {
  for_each = var.targets

  policy_id = aws_organizations_policy.esta.id
  target_id = each.value
}
