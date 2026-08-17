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
# e nenhum workflow além de build.yml (que só builda, não toca a nuvem) chega a
# rodar de ponta a ponta.
#
# A condição de confiança certa: o GitHub muda o formato do sub claim do token
# OIDC quando o job referencia um Environment. Referenciando, o formato é
# `repo:ORG/REPO:environment:NOME`, e NÃO inclui o evento que disparou o
# workflow (https://docs.github.com/en/actions/reference/security/oidc).
# Como preview-pr.yml, deploy-dev.yml, candidato-hml.yml e promocao-prd.yml
# TODOS referenciam Environment (dev, homologacao ou producao), a condição
# certa é por Environment, não por pull_request/workflow_dispatch como a task
# original deste organismo presumia — checar por evento seria condição que o
# token nunca satisfaz, e a role nunca seria assumível.
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
  # `repo:org/repo:environment:NOME` quando a role é por Environment (um valor
  # só: Environment é sempre um nome fechado, sem alternativa a cobrir).
  # `repo:org/repo:EVENTO` por evento puro (sem Environment) — aqui SIM pode
  # ser mais de um: `build.yml` dispara por `pull_request` e por `push` em
  # `main`, e os dois jobs de imagem/registro rodam sob a MESMA role
  # (esteira-registro), então a condição precisa casar os dois subs.
  subs_por_role = {
    for chave, role in var.roles : chave => (
      role.ambiente_github != null
      ? ["repo:${var.repo_servico}:environment:${role.ambiente_github}"]
      : [for evento in role.eventos : "repo:${var.repo_servico}:${evento}"]
    )
  }

  # A organização dona, tirada do repo declarado (mesmo reforço que
  # oidc-github aplicou): sem esta condição à parte, a trust por sub vale
  # para qualquer conta do GitHub que registre o mesmo par organização/repo —
  # nome que ninguém reservou é de quem chegar primeiro.
  dono = split("/", var.repo_servico)[0]
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

    # Igualdade, não StringLike: cada sub aqui é um valor fechado, sem wildcard
    # a casar. StringLike ficaria mais largo do que a condição exige — o risco
    # de curinga seria maior que em oidc-github, porque nome de Environment é
    # criado por qualquer pessoa com escrita no repositório, e um asterisco
    # solto deixaria um Environment qualquer assumir a role de outro estágio.
    # `values` com mais de um item faz OR entre eles (é como a AWS documenta a
    # condição): é o que deixa esteira-registro casar tanto pull_request
    # quanto push em main, sem um statement por evento.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.subs_por_role[each.key]
    }

    # A dona do repositório, conferida à parte do sub — mesmo reforço que
    # oidc-github aplicou.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:repository_owner"
      values   = [local.dono]
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
