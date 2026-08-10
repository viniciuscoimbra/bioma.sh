terraform {
  required_version = ">= 1.11"
  required_providers {
    aws   = { source = "hashicorp/aws", version = ">= 6.40.0, < 7.0.0" }
    kafka = { source = "Mongey/kafka", version = ">= 0.7" }
  }
}
