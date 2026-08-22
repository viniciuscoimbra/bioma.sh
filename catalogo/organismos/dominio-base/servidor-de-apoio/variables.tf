variable "dominio" { type = string }
variable "ambiente" { type = string }

variable "vpc_id" { type = string }

variable "subnet_ids" {
  type        = list(string)
  description = "sub-redes privadas da VPC do domínio, na ordem em que ela as publica; `subnet_index` de cada servidor indexa esta lista"

  validation {
    condition = alltrue([
      for s in var.servidores : s.subnet_index < length(var.subnet_ids)
    ])
    error_message = "algum servidor pede `subnet_index` além do fim de `subnet_ids`. O índice é posição na lista que a VPC publica, e não número de zona."
  }
}

variable "kms_key_arn" {
  type        = string
  description = "chave que cifra os discos. A cifra não é opcional aqui; o que é opcional é a chave ser da instituição ou a gerenciada pela AWS, e nulo escolhe a segunda."
  default     = null
}

variable "kms_sessao_ssm_arn" {
  type        = string
  description = "chave das sessões do SSM. Sessão cifrada com chave da instituição exige que a própria máquina possa usar a chave, e sem esta permissão a sessão falha ao abrir. Nulo dispensa a permissão, e a sessão continua funcionando sem essa cifra."
  default     = null
}

variable "criar_perfil_ssm" {
  type        = bool
  description = "cria a role e o perfil de instância que deixam o agente do SSM registrar a máquina. Falso quando a instalação já tem um perfil próprio, nomeado em `servidores[*].perfil_instancia`."
  default     = true
}

variable "chaves_publicas" {
  type        = map(string)
  description = "o CONTEÚDO da metade pública, por nome do par de chave. Só a metade pública, então nenhum segredo entra no estado. Vazio quando os pares já existem na conta e os servidores apenas os nomeiam em `chave`."
  default     = {}
}

variable "servidores" {
  type = map(object({
    ami  = string
    tipo = string

    subnet_index = optional(number, 0)

    # Endereço fixo quando alguma regra de firewall fora daqui foi escrita
    # contra ele. Nulo deixa a sub-rede escolher.
    ip_privado = optional(string)

    chave            = optional(string)
    perfil_instancia = optional(string)

    ebs_otimizado           = optional(bool, true)
    monitoramento_detalhado = optional(bool, false)

    # Quantos núcleos a máquina expõe, e quantos fios por núcleo. Existe para
    # software licenciado POR CORE: um t3.large entrega 2 vCPU, que são 1
    # núcleo com 2 fios, e a licença conta o que o sistema enxerga. Declarar
    # `nucleos = 1, fios_por_nucleo = 1` desliga o segundo fio e a máquina
    # passa a contar 1.
    #
    # Nulo é o default de propósito: sem declaração a AWS entrega o arranjo
    # padrão do tipo, e é isso que serve à esmagadora maioria das cargas.
    # Preencher sem precisar é pagar por vCPU que não é usada.
    #
    # ATENÇÃO: mudar isto numa máquina que já existe SUBSTITUI a instância —
    # `cpu_options` não é alterável em voo. O disco raiz vai junto; o que
    # estiver em `volumes_dados` sobrevive.
    nucleos         = optional(number)
    fios_por_nucleo = optional(number)

    disco_raiz = object({
      tamanho_gb = number
      tipo       = optional(string, "gp3")
    })

    # O que precisa sobreviver à máquina mora aqui, nunca no disco raiz.
    volumes_dados = optional(list(object({
      dispositivo = string
      tamanho_gb  = number
      tipo        = optional(string, "gp3")
    })), [])

    entradas = optional(list(object({
      descricao = string
      protocolo = optional(string, "tcp")

      # Nulas no protocolo "-1", que já cobre tudo e recusa faixa declarada.
      # `porta_final` ausente fecha a faixa na porta inicial.
      porta_inicial = optional(number)
      porta_final   = optional(number)

      cidrs            = optional(list(string), [])
      origens_servidor = optional(list(string), []) # outra chave deste mesmo mapa
      origens_grupo_id = optional(list(string), []) # grupo que nasce fora deste organismo
    })), [])

    etiquetas = optional(map(string), {})
  }))

  description = <<-TEXTO
    Os servidores de apoio deste domínio, por nome lógico. A chave é o batismo
    da instalação (o que a máquina hospeda), e o catálogo não conhece a lista.

    Tudo aqui é dado puro: nenhum campo recebe `module.x.y` nem um `sg-...`. A
    sub-rede entra por posição na lista que a VPC publica, e a origem de uma
    regra de entrada entra por chave deste mapa ou por id que a célula recebeu
    de quem cria o grupo. É o que permite a frota inteira viver num arquivo de
    valores, que não sabe resolver referência de módulo.
  TEXTO

  validation {
    condition = alltrue([
      for s in var.servidores : alltrue([
        for e in s.entradas :
        !contains(e.cidrs, "0.0.0.0/0") && !contains(e.cidrs, "::/0")
      ])
    ])
    error_message = "entrada aberta para 0.0.0.0/0 ou ::/0. Servidor de apoio não recebe do mundo: a origem é faixa de rede declarada ou grupo de segurança nomeado."
  }

  validation {
    condition = alltrue([
      for s in var.servidores : alltrue([
        for e in s.entradas :
        length(e.cidrs) + length(e.origens_servidor) + length(e.origens_grupo_id) > 0
      ])
    ])
    error_message = "entrada sem nenhuma origem. Sem `cidrs`, `origens_servidor` ou `origens_grupo_id` a regra não nasce, e a porta que alguém pediu fica fechada sem aviso."
  }

  validation {
    condition = alltrue([
      for s in var.servidores : alltrue([
        for e in s.entradas : alltrue([
          for o in e.origens_servidor : contains(keys(var.servidores), o)
        ])
      ])
    ])
    error_message = "`origens_servidor` nomeia servidor que não está neste mapa. A origem interna é a chave de outro servidor do mesmo organismo."
  }

  validation {
    condition = alltrue([
      for s in var.servidores : alltrue([
        for e in s.entradas :
        e.protocolo == "-1" ? e.porta_inicial == null : e.porta_inicial != null
      ])
    ])
    error_message = "porta e protocolo em desacordo: o protocolo \"-1\" cobre todas as portas e não aceita faixa; tcp e udp exigem `porta_inicial`."
  }

  default = {}
}

variable "politicas_gerenciadas" {
  type        = list(string)
  default     = []
  description = "políticas que a role da máquina anexa além do SSM básico; a gravação da sessão entra por aqui"
}
