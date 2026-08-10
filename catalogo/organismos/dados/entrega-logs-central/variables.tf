variable "plano" { type = string }
variable "firehose_arn" { type = string }

variable "contas_fonte" {
  type        = list(string)
  description = "ids das contas autorizadas a assinar o destination"
}
