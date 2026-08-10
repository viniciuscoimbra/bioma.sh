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
