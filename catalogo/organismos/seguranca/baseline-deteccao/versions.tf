terraform {
  required_version = ">= 1.11"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.40.0, < 7.0.0"

      # GuardDuty e Access Analyzer são regionais, e o Security Hub desta
      # célula não é: o agregador de findings junta todas as regiões a partir
      # de uma só. Por isso o alias existe para os dois primeiros e não para o
      # terceiro — o piso de detecção precisa nascer nas duas regiões que a
      # SCP da fundação permite, ou metade da organização fica sem vigia.
      configuration_aliases = [aws.secundaria]
    }
  }
}
