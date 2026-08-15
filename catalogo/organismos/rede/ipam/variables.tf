variable "regiao" { type = string }

variable "supernets" {
  type        = map(string)
  description = "ambiente -> supernet (ex.: prd 10.0.0.0/10, hml 10.64.0.0/10, dev 10.128.0.0/10)"
}
