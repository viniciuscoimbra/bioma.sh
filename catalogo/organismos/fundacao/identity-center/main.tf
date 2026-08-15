# Organismo identity-center: permission sets e atribuições (guia §7). Roda no
# delegated admin de identidade para contas-membro; o conjunto da management é
# gerido na management (restrição da AWS).
#
# Identidade humana tem um dono só, e quem é esse dono depende de existir um IdP
# corporativo. Enquanto não existe, o dono é o diretório do próprio Identity
# Center, e é esta receita que cria os grupos. Quando o IdP chegar, a troca é de
# fonte de identidade: os grupos passam a vir por SCIM e esta receita para de
# criá-los, declarando os nomes em `grupos_externos`. Os dois caminhos convivem
# no mesmo arquivo de propósito, porque a migração é uma linha de convenção e
# não uma reescrita.

data "aws_region" "atual" {}

# A instância do Identity Center existe numa região só, e este data source só a
# enxerga quando o provider da célula está nela. Sem a postcondição, a lista
# volta vazia, o `tolist(...)[0]` abaixo morre em `Invalid index` e o erro não
# nomeia região nenhuma: quem lê procura defeito na receita, e o defeito está na
# região de quem chamou.
data "aws_ssoadmin_instances" "esta" {
  lifecycle {
    postcondition {
      condition     = length(self.arns) > 0
      error_message = <<-ERRO
        O IAM Identity Center não responde em ${data.aws_region.atual.region}.

        Ele vive numa região só, a da instância. Ache a dela:
          aws sso-admin list-instances --region <região>
        e declare TG_REGIAO_IDENTITY_CENTER com a que responder.

        Se nenhuma região responder, o Identity Center ainda não foi habilitado
        nesta Organization, e habilitar é passo de console na conta de
        management: não há API que ligue o serviço.
      ERRO
    }
  }
}

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

# Os grupos que esta árvore cria, quando o diretório do Identity Center é a
# fonte. Nome é a chave, e não o identificador opaco: quem escreve a atribuição
# escreve "plataforma", e não um UUID que ninguém reconhece na revisão.
resource "aws_identitystore_group" "proprio" {
  for_each = toset(var.grupos_proprios)

  identity_store_id = local.identity_store_id
  display_name      = each.key
  description       = "grupo criado pela fundação; migra para o IdP quando ele existir"
}

locals {
  # nome -> id, de onde quer que ele venha. O grupo externo vence o próprio,
  # porque quando o IdP existe é ele que manda.
  grupo_id = merge(
    { for nome, g in aws_identitystore_group.proprio : nome => g.group_id },
    var.grupos_externos,
  )
}

resource "aws_ssoadmin_account_assignment" "atribuicao" {
  for_each = { for a in var.atribuicoes : "${a.conjunto}:${a.grupo}:${a.conta}" => a }

  instance_arn       = local.instance_arn
  permission_set_arn = aws_ssoadmin_permission_set.conjunto[each.value.conjunto].arn
  principal_type     = "GROUP"
  # o nome vira id aqui, e não na célula: assim a célula não muda quando a fonte
  # de identidade mudar
  principal_id = local.grupo_id[each.value.grupo]
  target_type  = "AWS_ACCOUNT"
  target_id    = each.value.conta
}
