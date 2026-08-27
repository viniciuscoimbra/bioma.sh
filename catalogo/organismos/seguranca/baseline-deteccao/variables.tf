variable "root_id" { type = string }

variable "standards_arns" {
  type        = list(string)
  description = "standards habilitados no piso (ex.: AWS Foundational Security Best Practices)"
}

variable "controles_desligados" {
  type        = list(string)
  default     = []
  description = "controles do Security Hub que esta instituição desliga; vazio é o piso, com todos ligados"

  # Vazio de propósito. A alternativa não é "menos controle", é controle
  # desligado sem ninguém saber qual: a API exige a lista, e escrevê-la vazia
  # deixa dito que o piso é todo o standard.
}

variable "guardduty_recursos" {
  type        = map(string)
  description = "features do GuardDuty e o alcance de cada uma nas contas-membro (ALL, NEW ou NONE)"

  # A lista é escrita inteira de propósito. Quando `features` não é declarado,
  # a API liga TODAS as opcionais menos RUNTIME_MONITORING — quer dizer que o
  # silêncio aqui não seria "o mínimo", seria "tudo o que a AWS decidir, na
  # versão de hoje". Escrita, cada feature vira linha de diff: ligar uma passa
  # a ser ato, e não efeito colateral de um apply.
  default = {
    # Agentless, barato e é justamente o que enxergaria um comprometimento nos
    # clusters `core-bancario`, que hoje rodam versão de Kubernetes fora de
    # suporte (EKS.2 e EKS.9 reprovados).
    EKS_AUDIT_LOGS = "ALL"

    S3_DATA_EVENTS      = "ALL"
    RDS_LOGIN_EVENTS    = "ALL"
    LAMBDA_NETWORK_LOGS = "ALL"

    # Faz cópia da EBS para varrer fora da conta. Não toca na instância e não
    # interrompe carga, mas é o item de maior efeito colateral do conjunto —
    # fica ligado por ser banco, e fica escrito por ser o que se desliga
    # primeiro se o custo apertar.
    EBS_MALWARE_PROTECTION = "ALL"

    # DESLIGADO de propósito: esta é a única feature que instala agente dentro
    # da carga (add-on gerido no EKS). Ligá-la hoje colocaria agente em cluster
    # de produção que já roda versão fora de suporte — trocar um achado de
    # postura por um risco operacional. Volta quando o EKS subir de versão.
    #
    # EKS_RUNTIME_MONITORING não entra nem desligado: declarar as duas na mesma
    # chamada é erro de API, porque RUNTIME_MONITORING já cobre o EKS.
    RUNTIME_MONITORING = "NONE"
  }
}
