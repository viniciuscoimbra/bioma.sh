terraform {
  required_version = ">= 1.11"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.40.0, < 7.0.0"

      # Metade do que este organismo liga é de conta e vale em toda parte; a
      # outra metade é de região e precisa ser ligada em cada uma. O alias
      # existe para a segunda metade.
      configuration_aliases = [aws.secundaria]
    }
  }
}
