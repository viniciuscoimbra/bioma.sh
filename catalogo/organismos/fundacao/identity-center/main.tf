# Organismo identity-center: permission sets e atribuições (guia §7). Roda no
# delegated admin de identidade para contas-membro; o conjunto da management é
# gerido na management (restrição da AWS). Usuários e grupos são do IdP, por
# SCIM: nunca dois donos para identidade humana.

data "aws_ssoadmin_instances" "esta" {}

locals {
  instance_arn      = tolist(data.aws_ssoadmin_instances.esta.arns)[0]
  identity_store_id = tolist(data.aws_ssoadmin_instances.esta.identity_store_ids)[0]
}

resource "aws_ssoadmin_permission_set" "conjunto" {
  for_each = var.permission_sets

  name             = each.key
  instance_arn     = local.instance_arn
  session_duration = each.value.duracao_sessao
}

resource "aws_ssoadmin_managed_policy_attachment" "politicas" {
  for_each = { for par in flatten([
    for nome, ps in var.permission_sets : [
      for arn in ps.managed_policies : { chave = "${nome}:${arn}", nome = nome, arn = arn }
    ]
  ]) : par.chave => par }

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.nome].arn
  managed_policy_arn = each.value.arn
}

resource "aws_ssoadmin_account_assignment" "atribuicao" {
  for_each = { for a in var.atribuicoes : "${a.conjunto}:${a.grupo_id}:${a.conta}" => a }

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.conjunto].arn
  principal_type     = "GROUP"
  principal_id       = each.value.grupo_id # o grupo vem do IdP via SCIM
  target_type        = "AWS_ACCOUNT"
  target_id          = each.value.conta
}
