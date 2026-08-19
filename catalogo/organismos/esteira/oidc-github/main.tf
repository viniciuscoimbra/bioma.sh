# Organismo oidc-github (15·D2): o contrato de deploy dentro de cada conta
# alvo. Célula de defesa da esteira: o dono é o time de esteira, a moradia é a
# conta. Roles separadas de plan e apply; trust restrito por repositório e
# referência. Em produção, a role de apply só é assumível pela esteira do dono
# do portão, definida no documento de esteira de entrega da instância.

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  # A AWS valida o certificado do GitHub contra a própria cadeia desde 2023 e
  # ignora esta impressão digital para este emissor. Ela fica porque a API a
  # exige, e não porque protege alguma coisa: o comentário anterior prometia
  # rotação por PR, ritual que não muda nada.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

locals {
  subs_permitidos = [for r in var.repos_permitidos : "repo:${r}"]

  # A organização dona, tirada do que a célula declarou. Uma só: repositório de
  # duas organizações diferentes no mesmo trilho é engano, não desenho.
  donos = distinct([for r in var.repos_permitidos : split("/", r)[0]])
}

data "aws_iam_policy_document" "trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Igualdade, e não semelhança. Com `ref:refs/heads/main` o curinga era
    # inofensivo; na forma `environment:<nome>` um asterisco solto faria o
    # workflow de um ambiente assumir o apply de todos, e nome de ambiente é
    # criado por qualquer pessoa com escrita no repositório. Curinga passa a
    # ser escolha escrita, e não o que acontece por descuido.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.subs_permitidos
    }

    # A dona do repositório, conferida à parte. Sem isto, a confiança vale para
    # qualquer conta do GitHub que registre um nome de organização igual ao que
    # a célula escreveu, e organização que ninguém registrou é de quem chegar
    # primeiro.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:repository_owner"
      values   = local.donos
    }
  }
}

resource "aws_iam_role" "plan" {
  name                 = "esteira-plan"
  assume_role_policy   = data.aws_iam_policy_document.trust.json
  max_session_duration = 3600
}

resource "aws_iam_role" "apply" {
  name                 = "esteira-apply"
  assume_role_policy   = data.aws_iam_policy_document.trust.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy_attachment" "plan_leitura" {
  role       = aws_iam_role.plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# a policy de apply é por trilho, mínima, e chega por var: a esteira não é admin
resource "aws_iam_role_policy" "apply_escopo" {
  name   = "escopo-do-trilho"
  role   = aws_iam_role.apply.id
  policy = var.policy_apply_json
}
