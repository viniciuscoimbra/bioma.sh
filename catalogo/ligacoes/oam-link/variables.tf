variable "sink_arn" { type = string }

variable "rotulo" {
  type    = string
  default = "$AccountName"
}

variable "tipos" {
  type    = list(string)
  default = ["AWS::CloudWatch::Metric", "AWS::Logs::LogGroup", "AWS::XRay::Trace"]
}
