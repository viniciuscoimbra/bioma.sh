# Ligação acesso-ao-dominio (03·D1): quem entra neste domínio, e com o quê.
#
# O Identity Center nasce na fundação, e os conjuntos gerais nascem com ele. O
# acesso a UM domínio não cabe lá: as políticas que ele concede são criadas
# pelas peças do domínio (o banco publica a de administrar, o túnel publica a
# de usar, o acesso auditado publica a de entrar), e a fundação roda antes
# delas existirem. Escrever os nomes dessas políticas na célula da fundação era
# digitar o que a árvore produz, e quebrar em silêncio no dia em que uma peça
# fosse renomeada.
#
# Ela mora no trilho do domínio, roda depois das peças, e recebe cada nome de
# política de quem o emite.

# A instância do Identity Center existe numa região só, e este data source só a
# enxerga quando o provider da célula está nela. Sem a postcondição, a lista
# volta vazia, o `tolist(...)[0]` abaixo morre em `Invalid index` e o erro não
# nomeia região nenhuma: quem lê procura defeito na receita, e o defeito está na
# região de quem chamou. Esta peça nasceu sem a guarda e caiu exatamente assim.
data "aws_region" "atual" {}

data "aws_ssoadmin_instances" "esta" {
  lifecycle {
    postcondition {
      condition     = length(self.arns) > 0
      error_message = "O IAM Identity Center não responde em ${data.aws_region.atual.region}. Ele vive numa região só, e o provider desta célula precisa estar nela."
    }
  }
}

locals {
  instance_arn      = tolist(data.aws_ssoadmin_instances.esta.arns)[0]
  identity_store_id = tolist(data.aws_ssoadmin_instances.esta.identity_store_ids)[0]
}

resource "aws_ssoadmin_permission_set" "conjunto" {
  for_each = var.conjuntos

  name             = each.key
  instance_arn     = local.instance_arn
  session_duration = each.value.duracao_sessao
  description      = each.value.descricao
}

# Política da própria conta, por NOME. É assim que o Identity Center a
# referencia, e o nome chega por output de quem a cria: a célula não o digita.
resource "aws_ssoadmin_customer_managed_policy_attachment" "propria" {
  for_each = merge([
    for nome, c in var.conjuntos : {
      for p in c.politicas_da_conta : "${nome}:${p}" => { conjunto = nome, politica = p }
    }
  ]...)

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.conjunto].arn

  customer_managed_policy_reference {
    name = each.value.politica
    path = "/"
  }
}

resource "aws_ssoadmin_managed_policy_attachment" "gerenciada" {
  for_each = merge([
    for nome, c in var.conjuntos : {
      for p in c.politicas_gerenciadas : "${nome}:${p}" => { conjunto = nome, politica = p }
    }
  ]...)

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.conjunto].arn
  managed_policy_arn = each.value.politica
}

# O grupo é de gente, e gente entra e sai sem que isso seja mudança de
# infraestrutura. Ele nasce vazio: quem o povoa é quem administra identidade.
resource "aws_identitystore_group" "proprio" {
  for_each = toset([for c in values(var.conjuntos) : c.grupo if c.grupo_id == null])

  identity_store_id = local.identity_store_id
  display_name      = each.value
  description       = "acesso ao dominio ${var.dominio}"
}

resource "aws_ssoadmin_account_assignment" "atribuicao" {
  for_each = var.conjuntos

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.key].arn

  principal_type = "GROUP"
  principal_id   = each.value.grupo_id != null ? each.value.grupo_id : aws_identitystore_group.proprio[each.value.grupo].group_id

  target_type = "AWS_ACCOUNT"
  target_id   = var.conta
}
