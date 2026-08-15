variable "ambiente" { type = string }
variable "vpc_endpoint_id" { type = string }

variable "rps_teto" {
  type    = number
  default = 500
}

variable "burst_teto" {
  type    = number
  default = 1000
}
