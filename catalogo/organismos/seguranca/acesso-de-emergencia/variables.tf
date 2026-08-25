variable "nome" {
  type        = string
  default     = "emergencia"
  description = "nome do conjunto de permissões e do grupo. O nome do conjunto é global na instância do Identity Center."
}

variable "contas" {
  type        = list(string)
  description = "contas onde a emergência vale. Produção, tipicamente: é lá que a via rotineira é estreita."
}

variable "duracao_sessao" {
  type        = string
  default     = "PT1H"
  description = "prazo máximo de cada entrada (03·D2). Curto de propósito: quem precisa de mais, entra de novo e avisa de novo."
}

variable "politica_gerenciada" {
  type        = string
  default     = "arn:aws:iam::aws:policy/AdministratorAccess"
  description = "o poder que a emergência concede. Amplo por natureza; o que o controla é o prazo, o registro e o aviso, não o recorte."
}

variable "kms_key_arn" {
  type        = string
  default     = null
  description = <<-TXT
    Chave que cifra o aviso parado no tópico. Nulo faz a peça criar a sua, e é
    o default por uma razão prática: a chave gerenciada da AWS não serve (não
    dá para liberar o EventBridge a publicar nela), e exigir uma chave de
    domínio inteira para cifrar um aviso faria a via de emergência esperar por
    uma dependência que não tem nada a ver com ela.
  TXT
}

variable "destinos_aviso" {
  type        = list(string)
  description = "endereços que recebem o aviso de toda mudança de acesso. Endereço de time, nunca de pessoa: pessoa sai da empresa e o aviso morre com ela."

  validation {
    condition     = length(var.destinos_aviso) > 0
    error_message = "Sem destino, a via de emergência nasce sem campainha: o grupo existiria, alguém entraria, e ninguém saberia."
  }
}
