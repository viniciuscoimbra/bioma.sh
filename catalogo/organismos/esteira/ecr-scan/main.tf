# Organismo ecr-scan (15·D3): registro de imagem com verificação contínua.
# Deploy referencia imagem por digest, nunca por tag mutável.

resource "aws_ecr_repository" "repo" {
  for_each = toset(var.repos)

  name                 = each.value
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = var.kms_key_arn
  }
}

# A Lambda por imagem, nas contas de domínio, puxa daqui como SERVIÇO — não é
# um principal da Organization, então aws:PrincipalOrgID não a alcança. O
# aws:SourceOrgID prende o serviço às funções nascidas dentro da Organization:
# sem esta policy, CreateFunction cross-account reprova com AccessDenied no
# acesso à imagem.
resource "aws_ecr_repository_policy" "pull_da_lambda" {
  for_each = aws_ecr_repository.repo

  repository = each.value.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # quem cria a função valida o acesso à imagem com a própria credencial,
      # antes de o serviço assumir o pull — as duas pernas são obrigatórias
      # no desenho cross-account documentado pela AWS
      {
        Sid       = "PullDeQuemCriaNaOrganization"
        Effect    = "Allow"
        Principal = { AWS = "*" }
        Action    = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Condition = { StringEquals = { "aws:PrincipalOrgID" = var.org_id } }
      },
      {
        Sid       = "PullDaLambdaDaOrganization"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
        Condition = { StringEquals = { "aws:SourceOrgID" = var.org_id } }
      }
    ]
  })
}

resource "aws_ecr_registry_scanning_configuration" "continuo" {
  scan_type = "ENHANCED" # Inspector: CVE contínuo em imagem e dependência

  rule {
    scan_frequency = "CONTINUOUS_SCAN"
    repository_filter {
      filter      = "*"
      filter_type = "WILDCARD"
    }
  }
}

resource "aws_ecr_lifecycle_policy" "limpeza" {
  for_each = aws_ecr_repository.repo

  repository = each.value.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "mantém as últimas ${var.imagens_retidas} imagens"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = var.imagens_retidas
      }
      action = { type = "expire" }
    }]
  })
}
