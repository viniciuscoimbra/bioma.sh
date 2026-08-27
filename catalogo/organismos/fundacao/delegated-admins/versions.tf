terraform {
  required_version = ">= 1.11"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.40.0, < 7.0.0"

      # O registro do admin do GuardDuty é regional, e a organização vive em
      # duas regiões (residência e réplica). Sem o alias, o registro nasce só
      # na primária e o controle GuardDuty.1 continua reprovando na outra —
      # metade da organização vigiada, sem erro nenhum.
      configuration_aliases = [aws.secundaria]
    }
  }
}
