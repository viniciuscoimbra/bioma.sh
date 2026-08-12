variable "config_da_organizacao_ligado" {
  type        = bool
  description = "o trusted access do AWS Config já está ligado nesta Organization"

  # Falso enquanto a landing zone não existe, porque o Control Tower recusa a
  # configuração quando acha o trusted access do Config ligado antes dele:
  # "The AWS account cannot have trusted access enabled in the organization
  # management account for AWS Config"
  # (controltower/latest/userguide/getting-started-prereqs.html).
  #
  # Depois que a landing zone sobe, quem liga o Config na Organization é o
  # próprio Control Tower. Aí esta variável vira `true`, e a lista fechada de
  # `aws_service_access_principals` passa a descrever o que existe em vez de
  # desligar o que o Control Tower acabou de ligar.
  default = false
}

variable "features_de_root" {
  type        = list(string)
  description = "gestão centralizada de root: apagar credencial de conta-membro e agir por sessão"

  # As duas por padrão porque a alternativa não é "menos controle", é root
  # espalhado: conta-membro que guarda a própria credencial de root guarda uma
  # identidade que nenhuma SCP alcança e nenhum IdP federa. Instituição que
  # queira o contrário declara a lista vazia, e a declaração fica no diff.
  default = ["RootCredentialsManagement", "RootSessions"]

  validation {
    condition = length(setsubtract(toset(var.features_de_root),
    ["RootCredentialsManagement", "RootSessions"])) == 0
    error_message = "as features de root são RootCredentialsManagement e RootSessions."
  }
}
