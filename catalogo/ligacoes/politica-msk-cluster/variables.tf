variable "cluster_arn" { type = string }
variable "contas_consumidoras" { type = list(string) }

variable "conectores_arns" {
  type        = list(string)
  default     = []
  description = "roles de conector de outra conta que falam o protocolo IAM direto com os brokers (o sink Iceberg da conta de dados)"
}

variable "topicos_dos_conectores" {
  type        = list(string)
  default     = []
  description = "nomes (ou padrões) dos tópicos que esses conectores leem e do tópico de controle que escrevem; o ARN se monta a partir do ARN do cluster"
}

variable "grupos_dos_conectores" {
  type        = list(string)
  default     = []
  description = "padrões dos grupos de consumo desses conectores (connect-<nome-do-conector>*)"
}

# Quem ESCREVE no barramento de outra conta. Lista à parte de `conectores_arns`
# porque produtor não lê e não coordena grupo; ver a razão no main.tf.
variable "produtores_arns" {
  type    = list(string)
  default = []
}

variable "topicos_dos_produtores" {
  type    = list(string)
  default = []
}

# Quem lê ou escreve com escopo PRÓPRIO. As listas acima dividem um escopo só
# entre todos os seus principais, e a de conectores ainda carrega o que o worker
# do MSK Connect precisa (WriteData, CreateTopic, transactional-id): um leitor
# que não é conector herdaria tudo isso para ler um tópico. Cada entrada junta
# os principais que alcançam os mesmos tópicos e grupos, e o nome dela vira o
# prefixo do Sid dos statements que ela gera.
variable "leitores" {
  type = map(object({
    principais = list(string)
    topicos    = list(string)
    grupos     = optional(list(string), [])
  }))
  default     = {}
  description = "nome da entrada => principais que conectam, leem os tópicos listados e coordenam os grupos listados; sem grupo, a entrada não gera o statement de coordenação"

  validation {
    condition     = alltrue([for nome in keys(var.leitores) : can(regex("^[A-Za-z0-9]+$", nome)) && !contains(["ConectoresDeOutraConta", "ProdutoresDeOutraConta"], nome)])
    error_message = "o nome da entrada vira prefixo de Sid: só letra e número, e fora dos prefixos que a receita já usa (ConectoresDeOutraConta, ProdutoresDeOutraConta)."
  }

  validation {
    condition     = alltrue([for l in values(var.leitores) : length(l.principais) > 0 && length(l.topicos) > 0])
    error_message = "cada entrada precisa de ao menos um principal e um tópico; lista vazia vira statement sem principal ou sem recurso."
  }
}

variable "escritores" {
  type = map(object({
    principais = list(string)
    topicos    = list(string)
  }))
  default     = {}
  description = "nome da entrada => principais que conectam com escrita idempotente e escrevem nos tópicos listados, sem ler e sem criar tópico"

  validation {
    condition     = alltrue([for nome in keys(var.escritores) : can(regex("^[A-Za-z0-9]+$", nome)) && !contains(["ConectoresDeOutraConta", "ProdutoresDeOutraConta"], nome)])
    error_message = "o nome da entrada vira prefixo de Sid: só letra e número, e fora dos prefixos que a receita já usa (ConectoresDeOutraConta, ProdutoresDeOutraConta)."
  }

  validation {
    condition     = alltrue([for e in values(var.escritores) : length(e.principais) > 0 && length(e.topicos) > 0])
    error_message = "cada entrada precisa de ao menos um principal e um tópico; lista vazia vira statement sem principal ou sem recurso."
  }
}
