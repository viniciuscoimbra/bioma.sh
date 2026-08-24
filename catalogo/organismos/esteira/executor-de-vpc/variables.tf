variable "nome" {
  type        = string
  description = "o que este executor serve (ex.: mensageria-prod); entra em todo recurso"
}

variable "conta" { type = string }
variable "regiao" { type = string }

variable "vpc_id" { type = string }

variable "subnet_ids" {
  type        = list(string)
  description = "as sub-redes onde a interface do executor nasce; precisam alcançar o destino do trabalho"

  validation {
    condition     = length(var.subnet_ids) > 0
    error_message = "Executor sem sub-rede não entra em VPC nenhuma, que é a única razão dele existir."
  }
}

variable "security_group_ids" {
  type        = list(string)
  default     = []
  description = "grupos ADICIONAIS ao próprio; é aqui que entra o grupo que o destino admite (o do cluster, para falar na 9098)"
}

variable "kms_key_arn" {
  type        = string
  description = "a chave que cifra o log do executor; o que ele imprime é rastro de mudança"
}

variable "balde_artefatos_arn" {
  type        = string
  description = "o balde de onde ele lê o pacote do trabalho (o repositório empacotado pela esteira)"
}

variable "buildspec" {
  type        = string
  description = "o que ele faz, em YAML; a célula declara, porque o trabalho é da célula e não do organismo"
}

variable "politica_do_trabalho" {
  type    = string
  default = null
  # Sem default de propósito: um executor que cria tópico e um que aplica outra
  # coisa não têm o mesmo alcance, e herdar alcance é como permissão sobra sem
  # ninguém decidir.
  description = "JSON da policy do que este executor pode tocar, nomeado por extenso na célula"
}

variable "variaveis" {
  type        = map(string)
  default     = {}
  description = "variáveis de ambiente do trabalho (TG_*, região, conta); segredo nunca entra aqui, entra por secretsmanager"
}

variable "imagem" {
  type        = string
  default     = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
  description = "imagem gerenciada da AWS; o executor não constrói aplicação, então não precisa de imagem própria"
}

variable "minutos_limite" {
  type    = number
  default = 30

  validation {
    condition     = var.minutos_limite >= 5 && var.minutos_limite <= 480
    error_message = "Entre 5 e 480 minutos, que é o que o CodeBuild aceita."
  }
}

variable "retencao_dias" {
  type    = number
  default = 365
}
