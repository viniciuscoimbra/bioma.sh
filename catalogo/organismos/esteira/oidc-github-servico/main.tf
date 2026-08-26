# Organismo oidc-github-servico (15·D2, 15·D7): o contrato de deploy do
# REPOSITÓRIO DE APLICAÇÃO em cada conta — distinto de organismos/esteira/
# oidc-github, que confia no repo -live de infraestrutura (trust fixo em
# refs/heads/main) e não serve para os workflows de esteira-workflows/, que
# disparam por pull_request (preview) e por workflow_dispatch (homologação).
#
# EFEITO NA PIPELINE DE ENTREGA: sem esta receita aplicada, os passos
# `aws-actions/configure-aws-credentials` de build.yml, preview-pr.yml,
# deploy-dev.yml, candidato-hml.yml e promocao-prd.yml não têm role para
# assumir — a esteira do serviço não consegue autenticar em nenhuma conta AWS,
# e nenhum workflow chega a rodar de ponta a ponta (build.yml incluído: ele
# assume a role de registro para publicar a imagem no ECR).
#
# A condição de confiança certa: o GitHub muda o formato do sub claim do token
# OIDC quando o job referencia um Environment. Referenciando, o formato é
# `repo:<org>@<org_id>/<repo>@<repo_id>:environment:<nome>` (o formato imutável,
# ver variables.tf), e NÃO inclui o evento que disparou o workflow
# (https://docs.github.com/en/actions/reference/security/oidc). Como
# preview-pr.yml, deploy-dev.yml, candidato-hml.yml e promocao-prd.yml TODOS
# referenciam Environment (dev, homologacao ou producao), a condição certa é
# por Environment, não por pull_request/workflow_dispatch como a task original
# deste organismo presumia — checar por evento seria condição que o token nunca
# satisfaz, e a role nunca seria assumível.
#
# Confirmado em conta real (2026-08-24, trilho de desenvolvimento de uma
# instalação): o sub emitido pelo job com Environment chegou no formato
# imutável e a role foi assumida.
#
# CORREÇÃO 2 (ao escrever a célula que instancia esteira-registro): build.yml
# não tem Environment, mas também não tem UM evento só — ele dispara por
# `pull_request` (todo PR builda e escaneia) e por `push` em `main` (o commit
# que efetivamente publica a imagem que os estágios seguintes promovem). Os
# dois disparos rodam o mesmo job de imagem, sob a mesma role. `var.roles`
# aceita `eventos` como LISTA por isso: um único `evento` (singular, como a
# formulação original deste organismo previa) deixaria a role assumível só na
# metade dos disparos de build.yml.

data "aws_iam_openid_connect_provider" "github" {
  arn = var.oidc_provider_arn
}

locals {
  # Formato imutável do sub claim (ver o comentário em variables.tf,
  # repo_owner_id/repo_id): substitui "org/repo" por "org@org_id/repo@repo_id"
  # como base do sub.
  dono          = split("/", var.repo_servico)[0]
  nome          = split("/", var.repo_servico)[1]
  repo_imutavel = "${local.dono}@${var.repo_owner_id}/${local.nome}@${var.repo_id}"

  # `repo:<imutável>:environment:<nome>` quando a role é por Environment (um
  # valor só: Environment é sempre um nome fechado, sem alternativa a cobrir).
  # `repo:<imutável>:<evento>` por evento puro (sem Environment) — aqui SIM
  # pode ser mais de um: `build.yml` dispara por `pull_request` e por `push`
  # em `main`, e os dois jobs de imagem e registro rodam sob a MESMA role
  # (esteira-registro), então a condição precisa casar os dois subs.
  #
  # Esta restrição esteve fora daqui por um dia, trocada por um wildcard
  # `repo:<imutável>:*` que valia para todas as roles, porque a versão
  # restrita não casava com o sub real. O que não casava era o REPOSITÓRIO,
  # ainda escrito no formato antigo — e não o estágio no fim do sub. O
  # CloudTrail da conta de devsecops guarda os subs aceitos em 2026-08-21, e
  # eles trazem o estágio:
  #
  #   repo:<org>@<org_id>/<repo>@<repo_id>:pull_request
  #   repo:<org>@<org_id>/<repo>@<repo_id>:ref:refs/heads/main
  #
  # Com o wildcard, qualquer sub emitido para o repositório abria a trust de
  # TODAS as roles: o workflow de preview assumiria a role de produção, e o
  # que separava os estágios passava a ser só a policy de permissão de cada
  # uma. O isolamento volta para onde ele nasce, que é a relação de confiança.
  # repos_adicionais (achado em conta real, 2026-08-26): uma role
  # de registro compartilhada entre domínios precisa do mesmo conjunto de
  # eventos para CADA repositório que publica ali, não só para
  # var.repo_servico — o sub de um repositório extra não casa com
  # repo_imutavel, então sem isto a role só teria trust do repo principal.
  subs_por_role = {
    for chave, role in var.roles : chave => (
      role.ambiente_github != null
      ? ["repo:${local.repo_imutavel}:environment:${role.ambiente_github}"]
      : concat(
        [for evento in role.eventos : "repo:${local.repo_imutavel}:${evento}"],
        flatten([
          for extra in coalesce(role.repos_adicionais, []) : [
            for evento in role.eventos :
            "repo:${split("/", extra.repo)[0]}@${extra.owner_id}/${split("/", extra.repo)[1]}@${extra.repo_id}:${evento}"
          ]
        ])
      )
    )
  }
}

data "aws_iam_policy_document" "trust" {
  for_each = var.roles

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # StringLike, e não StringEquals: é o teste que funcionou contra o sub
    # imutável em conta real, e o padrão sem curinga casa exato do mesmo jeito.
    # `values` com mais de um item faz OR entre eles, que é o que deixa uma
    # role de registro casar `pull_request` e `push` em `main` sem um statement
    # por evento.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.subs_por_role[each.key]
    }
  }
}

resource "aws_iam_role" "esta" {
  for_each = var.roles

  name                 = "esteira-${each.key}"
  assume_role_policy   = data.aws_iam_policy_document.trust[each.key].json
  max_session_duration = 3600
}

# A policy de cada estágio chega já pronta na var: esta receita não decide
# QUANTO cada estágio pode tocar, só ONDE a confiança nasce. O escopo mínimo
# por trilho é decisão de quem instancia (mesmo padrão de oidc-github).
resource "aws_iam_role_policy" "escopo" {
  for_each = var.roles

  name   = "escopo-do-estagio"
  role   = aws_iam_role.esta[each.key].id
  policy = each.value.policy_json
}
