# Story: valida o módulo com os dois providers (exigência do alias).

terraform {
  required_version = ">= 1.11"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 6.40.0, < 7.0.0" }
  }
}

provider "aws" {
  region = "sa-east-1"
}

provider "aws" {
  alias  = "secundaria"
  region = "us-east-1"
}

module "chave" {
  source    = "../"
  providers = { aws = aws, aws.secundaria = aws.secundaria }

  dominio  = "exemplo"
  ambiente = "dev"
  key_policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "root"
      Effect    = "Allow"
      Principal = { AWS = "arn:aws:iam::111111111111:root" }
      Action    = "kms:*"
      Resource  = "*"
    }]
  })
}
