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

# O grupo é o que recebe acesso, e a pessoa entra nele. Um conjunto pode servir
# a mais de um grupo: sessão gravada vale igual para quem instala o produto e
# para quem opera o domínio, e o que muda é quem está dentro.
locals {
  grupos_declarados = distinct(flatten([for c in values(var.conjuntos) : c.grupos]))

  # grupo -> conjunto, para a atribuição
  atribuicoes = merge([
    for nome, c in var.conjuntos : {
      for g in c.grupos : "${nome}:${g}" => { conjunto = nome, grupo = g }
    }
  ]...)
}

resource "aws_identitystore_group" "proprio" {
  for_each = toset([for g in local.grupos_declarados : g if !contains(keys(var.grupos_externos), g)])

  identity_store_id = local.identity_store_id
  display_name      = each.value
  description       = "acesso ao dominio ${var.dominio}"
}

locals {
  id_do_grupo = merge(
    { for g, id in var.grupos_externos : g => id },
    { for g, r in aws_identitystore_group.proprio : g => r.group_id },
  )
}

# A pessoa, enquanto não há IdP corporativo. Quando ele chegar, o SCIM passa a
# provisionar e este bloco some da célula: `pessoas` vazio e nada mais muda.
#
# O e-mail é o identificador que a AWS usa para o convite e o primeiro acesso,
# e ele é obrigatório: sem endereço, o usuário nasce e ninguém consegue entrar.
resource "aws_identitystore_user" "pessoa" {
  for_each = var.pessoas

  identity_store_id = local.identity_store_id
  user_name         = each.key
  display_name      = each.value.nome

  name {
    given_name  = each.value.primeiro_nome
    family_name = each.value.sobrenome
  }

  emails {
    value   = each.value.email
    primary = true
  }
}

resource "aws_identitystore_group_membership" "pertence" {
  for_each = merge([
    for nome, p in var.pessoas : {
      for g in p.grupos : "${nome}:${g}" => { pessoa = nome, grupo = g }
    }
  ]...)

  identity_store_id = local.identity_store_id
  group_id          = local.id_do_grupo[each.value.grupo]
  member_id         = aws_identitystore_user.pessoa[each.value.pessoa].user_id
}

resource "aws_ssoadmin_account_assignment" "atribuicao" {
  for_each = local.atribuicoes

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.conjunto].arn

  principal_type = "GROUP"
  principal_id   = local.id_do_grupo[each.value.grupo]

  target_type = "AWS_ACCOUNT"
  target_id   = coalesce(var.conjuntos[each.value.conjunto].conta, var.conta)
}
