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
    # Agentless e barato, e é o que enxerga comprometimento de cluster sem
    # depender de agente — inclusive onde o Kubernetes ainda roda versão fora
    # de suporte, que é justamente onde o agente não deveria entrar.
    EKS_AUDIT_LOGS = "ALL"

    S3_DATA_EVENTS      = "ALL"
    RDS_LOGIN_EVENTS    = "ALL"
    LAMBDA_NETWORK_LOGS = "ALL"

    # Faz cópia da EBS para varrer fora da conta. Não toca na instância e não
    # interrompe carga, mas é o item de maior efeito colateral do conjunto —
    # fica ligado no piso, e fica escrito por ser o primeiro que se desliga se
    # o custo apertar.
    EBS_MALWARE_PROTECTION = "ALL"

    # DESLIGADA no piso: é a única feature que instala agente dentro da carga
    # (add-on gerido no EKS). Ligá-la sobre cluster de produção que roda versão
    # fora de suporte troca um achado de postura por um risco operacional. Quem
    # tem o parque em versão suportada liga aqui, e o diff diz que ligou.
    #
    # EKS_RUNTIME_MONITORING não entra nem desligado: declarar as duas na mesma
    # chamada é erro de API, porque RUNTIME_MONITORING já cobre o EKS.
    RUNTIME_MONITORING = "NONE"
  }
}
