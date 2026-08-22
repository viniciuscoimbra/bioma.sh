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
  # Formato imutável do sub claim (ver o comentário em variables.tf,
  # repo_owner_id/repo_id): substitui "org/repo" por "org@org_id/repo@repo_id"
  # como base do sub.
  dono          = split("/", var.repo_servico)[0]
  nome          = split("/", var.repo_servico)[1]
  repo_imutavel = "${local.dono}@${var.repo_owner_id}/${local.nome}@${var.repo_id}"

  # RELAÇÃO DE CONFIANÇA TESTADA E FUNCIONAL (2026-08-21, achado real contra a
  # AWS): StringLike com um único wildcard cobrindo o repositório inteiro —
  # "repo:<repo_imutavel>:*" — não StringEquals por Environment/evento
  # enumerado, e sem condição extra de repository_owner. Essa é a
  # configuração que de fato desbloqueou sts:AssumeRoleWithWebIdentity nos
  # testes reais; a diferenciação por Environment/evento por role
  # (subs_por_role, condição StringEquals) foi tentada antes e não casou com
  # o sub real emitido pelo GitHub.
  #
  # TROCA ACEITA: qualquer sub emitido para este repositório (qualquer
  # workflow, qualquer Environment, qualquer evento) passa a condição de
  # trust de TODAS as roles deste organismo — a diferenciação por estágio
  # (registro/dev/hml/prd) fica só na policy de permissão de cada role
  # (aws_iam_role_policy.escopo), não mais na trust. Antes de reforçar esse
  # isolamento de volta, confirmar contra a AWS real que a versão restrita
  # por Environment/evento também funciona (o achado registrado é que ela
  # não casou no teste).
  sub_wildcard = "repo:${local.repo_imutavel}:*"
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

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = [local.sub_wildcard]
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
