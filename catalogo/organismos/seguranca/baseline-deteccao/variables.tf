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
  type = map(object({
    auto_enable = string
    adicionais = list(object({
      name        = string
      auto_enable = string
    }))
  }))
  description = "features do GuardDuty, o alcance de cada uma nas contas-membro (ALL, NEW ou NONE) e as sub-configurações de agente"

  # A lista é escrita inteira de propósito. Quando `features` não é declarado,
  # a API liga TODAS as opcionais menos RUNTIME_MONITORING — quer dizer que o
  # silêncio aqui não seria "o mínimo", seria "tudo o que a AWS decidir, na
  # versão de hoje". Escrita, cada feature vira linha de diff: ligar uma passa
  # a ser ato, e não efeito colateral de um apply.
  default = {
    # Agentless e barato, e é o que enxerga comprometimento de cluster sem
    # depender de agente — inclusive onde o Kubernetes ainda roda versão fora
    # de suporte, que é justamente onde o agente não deveria entrar.
    EKS_AUDIT_LOGS = { auto_enable = "ALL", adicionais = [] }

    S3_DATA_EVENTS      = { auto_enable = "ALL", adicionais = [] }
    RDS_LOGIN_EVENTS    = { auto_enable = "ALL", adicionais = [] }
    LAMBDA_NETWORK_LOGS = { auto_enable = "ALL", adicionais = [] }

    # Faz cópia da EBS para varrer fora da conta. Não toca na instância e não
    # interrompe carga, mas é o item de maior efeito colateral do conjunto —
    # fica ligado no piso, e fica escrito por ser o primeiro que se desliga se
    # o custo apertar.
    EBS_MALWARE_PROTECTION = { auto_enable = "ALL", adicionais = [] }

    # DESLIGADA no piso, e desligada nas três portas. É a única feature que
    # instala agente dentro da carga, e o desligamento dela tem dois níveis: a
    # feature, e as sub-configurações que dizem ONDE o agente entraria. Sem
    # declarar as três, a AWS as preenche sozinha e o plano seguinte propõe
    # substituir o recurso a cada rodada — o desligamento existiria de fato e
    # não estaria escrito, que é a diferença entre uma garantia e uma sorte.
    #
    # EKS_RUNTIME_MONITORING não entra nem desligada: declarar as duas na mesma
    # chamada é erro de API, porque RUNTIME_MONITORING já cobre o EKS.
    RUNTIME_MONITORING = {
      auto_enable = "NONE"
      # LISTA, e nesta ordem, de propósito. `additional_configuration` é bloco
      # ordenado: o Terraform compara posição por posição, e posição trocada
      # força substituição. Um map ordenaria alfabeticamente e brigaria para
      # sempre com a ordem em que a API devolve, deixando todo plano futuro com
      # "2 to destroy" — e num repositório onde o plano é portão, destruição que
      # aparece sempre é destruição que ninguém lê mais.
      adicionais = [
        { name = "ECS_FARGATE_AGENT_MANAGEMENT", auto_enable = "NONE" },
        { name = "EC2_AGENT_MANAGEMENT", auto_enable = "NONE" },
        { name = "EKS_ADDON_MANAGEMENT", auto_enable = "NONE" },
      ]
    }
  }
}

variable "regioes_ligadas" {
  type        = list(string)
  description = "regiões cujos achados o agregador puxa para a região de agregação; a própria região de agregação não entra na lista"

  # Sem default de propósito. Um default aqui seria a lista de regiões de
  # OUTRA instituição, e o agregador nasceria puxando achado de onde esta não
  # opera — que é exatamente o defeito que esta variável existe para corrigir.
}

variable "inspector_recursos" {
  type        = list(string)
  default     = ["EC2", "ECR", "LAMBDA", "LAMBDA_CODE"]
  description = "o que o Inspector varre nas contas da organização"

  # Os quatro são os quatro controles que o piso mede. Tirar um daqui é
  # aceitar que o controle correspondente reprove, e é para isso que a lista
  # existe escrita: a decisão fica no diff, com o custo dela.
}
