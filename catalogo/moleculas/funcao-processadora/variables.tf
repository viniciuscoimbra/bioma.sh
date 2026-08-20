variable "nome" { type = string }
variable "imagem_inicial" {
  type        = string
  description = "URI da imagem de bootstrap no ECR, por digest; a esteira governa as seguintes"
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "etiquetas dos átomos desta molécula, somadas às default_tags do provider"
}

variable "memoria_mb" {
  type    = number
  default = 512
}

variable "timeout_s" {
  type    = number
  default = 60
}

variable "retencao_log_dias" {
  type    = number
  default = 30
}

variable "kms_key_arn" {
  type    = string
  default = null
}

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "alarm_actions" {
  type    = list(string)
  default = []
}

variable "variaveis_de_ambiente" {
  type        = map(string)
  default     = {}
  description = <<-EOF
    Variáveis de ambiente da função (ex.: SecretsManager__SecretId, apontando
    o NOME do segredo — nunca o valor sensível em si, que fica no Secrets
    Manager). Necessário para desembolso-dev/hml (teste da esteira de
    preview): sem env var nenhuma, a aplicação .NET falha rápido no startup
    por não achar o secret configurado (Program.cs,
    AddAwsSecretsManager(SecretsManager:SecretId)).
  EOF
}
