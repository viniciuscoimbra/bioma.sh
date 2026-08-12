variable "landing_zone_de_pe" {
  type        = bool
  description = "a landing zone do Control Tower já existe nesta Organization"

  # Falso antes dela, porque o Control Tower recusa a configuração quando acha
  # o trusted access do AWS Config ligado antes dele: "The AWS account cannot
  # have trusted access enabled in the organization management account for AWS
  # Config" (controltower/latest/userguide/getting-started-prereqs.html).
  #
  # Verdadeiro depois. Ao nascer, a landing zone liga na Organization o acesso
  # confiável do Config e o dos stack sets em conta-membro, e é ela quem passa
  # a gerir os dois. A lista de `aws_service_access_principals` é fechada: com
  # esta variável falsa depois da landing zone existir, o apply seguinte
  # desliga o que o Control Tower acabou de ligar, e leva junto os stack sets
  # que mantêm as contas inscritas.
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
