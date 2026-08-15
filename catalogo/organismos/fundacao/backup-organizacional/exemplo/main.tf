# Story do organismo: o exemplo mínimo instanciável (catálogo, regime de teste).
# É este diretório que o tier A valida, porque o módulo exige provider aliased
# e não roda como raiz. Valores de brinquedo.

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

module "backup" {
  source    = "../"
  providers = { aws = aws, aws.secundaria = aws.secundaria }

  nome             = "exemplo"
  kms_primaria_arn = "arn:aws:kms:sa-east-1:111111111111:key/00000000-0000-0000-0000-000000000000"
  kms_replica_arn  = "arn:aws:kms:us-east-1:111111111111:key/00000000-0000-0000-0000-000000000000"
  role_backup_arn  = "arn:aws:iam::111111111111:role/backup-exemplo"
}
