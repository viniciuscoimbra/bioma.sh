# Organismo oidc-github (15·D2): o contrato de deploy dentro de cada conta
# alvo. Célula de defesa da esteira: o dono é o time de esteira, a moradia é a
# conta. Roles separadas de plan e apply; trust restrito por repositório e
# referência. Em produção, a role de apply só é assumível pela esteira do dono
# do portão, definida no documento de esteira de entrega da instância.

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"] # raiz atual; rotação por PR
}

locals {
  subs_permitidos = [for r in var.repos_permitidos : "repo:${r}"]
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

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = local.subs_permitidos
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
