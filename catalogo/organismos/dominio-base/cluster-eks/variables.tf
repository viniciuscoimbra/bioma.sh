variable "nome" {
  type        = string
  description = "nome do cluster; a célula batiza, e o nome entra em papel IAM, política, fila e tag de descoberta do Karpenter"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.nome))
    error_message = "Nome em minúsculas, começando por letra: ele entra em nome de recurso."
  }

  validation {
    # Nome de papel IAM para em 64 caracteres, e o prefixo mais longo desta
    # receita (AmazonEKSLoadBalancerControllerRole-) já ocupa 36. Estourar não
    # aparece no validate nem no plano: reprova no apply, quando o plano de
    # controle já subiu e falta só o papel do controlador.
    condition     = length(var.nome) <= 28
    error_message = "O nome tem no máximo 28 caracteres: os prefixos dos papéis IAM desta receita consomem os outros 36 do limite de 64."
  }
}

variable "dominio" { type = string }

variable "ambiente" {
  type = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.ambiente))
    error_message = "Ambiente em minúsculas, começando por letra: ele entra em tag e em nome de recurso."
  }
}

variable "vpc_id" {
  type        = string
  description = "a VPC onde o cluster nasce, vinda do output da rede do domínio"

  validation {
    # Pela dependência, e não por consulta à nuvem: valor de mock que alimenta
    # um `data` vira chamada real com identificador inventado, já no plano.
    condition     = startswith(var.vpc_id, "vpc-")
    error_message = "O identificador da VPC, vindo do output da receita de rede."
  }
}

variable "subnets_privadas" {
  type        = list(string)
  description = "as subnets privadas que hospedam o plano de controle e os nós, vindas do output da rede do domínio"

  validation {
    condition     = length(var.subnets_privadas) >= 2
    error_message = "O EKS exige subnets em pelo menos duas zonas de disponibilidade."
  }

  validation {
    condition     = alltrue([for s in var.subnets_privadas : startswith(s, "subnet-")])
    error_message = "Cada entrada é um identificador de subnet, vindo do output da receita de rede."
  }
}

variable "versao_kubernetes" {
  type        = string
  default     = "1.32"
  description = "versão do Kubernetes no plano de controle; fixada aqui, e não deixada no default do provider, para o upgrade ser uma decisão escrita"
}

variable "tipos_de_instancia" {
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
  description = "tipos de instância do node group de bootstrap"
}

variable "bootstrap_desejado" {
  type        = number
  default     = 2
  description = "nós desejados no node group de bootstrap"
}

variable "bootstrap_minimo" {
  type        = number
  default     = 2
  description = "mínimo de nós no node group de bootstrap"
}

# O máximo tem de ser MAIOR que o desejado, e isso não é folga de capacidade: é
# espaço para a troca. Subir versão substitui nó, e substituir exige subir o
# novo antes de drenar o velho. Com máximo igual ao desejado a AWS recusa com
# "new nodes are not joining node group", que soa como problema de rede e é
# falta de lugar.
variable "bootstrap_maximo" {
  type        = number
  default     = 4
  description = "máximo de nós no node group de bootstrap"
}

variable "modo_de_autenticacao" {
  type        = string
  default     = "API_AND_CONFIG_MAP"
  description = <<-EOT
    Modo de autenticação do cluster. "API" usa somente access entries, que são auditáveis
    de fora e dispensam o ConfigMap aws-auth editável dentro do cluster.

    Migrar de API_AND_CONFIG_MAP para API é irreversível e derruba quem só existia no
    aws-auth: só mude depois de conferir que todo acesso está descrito como access entry.
  EOT

  validation {
    condition     = contains(["API", "API_AND_CONFIG_MAP"], var.modo_de_autenticacao)
    error_message = "modo_de_autenticacao é API ou API_AND_CONFIG_MAP (CONFIG_MAP puro está depreciado)."
  }
}

variable "criador_vira_admin" {
  type        = bool
  default     = true
  description = <<-EOT
    Dá cluster-admin ao principal que rodar o apply. Vale só na criação: ligar ou desligar
    depois não muda nada no cluster existente.

    Com true, quem aplicou vira admin do cluster de forma permanente e implícita. Com
    false, o acesso administrativo precisa estar mapeado como access entry ANTES do
    primeiro apply, senão ninguém entra no cluster recém-criado.
  EOT
}

variable "endpoint_publico" {
  type        = bool
  default     = false
  description = "expõe o servidor de API na internet; fechado por padrão, e aberto por decisão escrita da célula"
}

variable "endpoint_privado" {
  type        = bool
  default     = true
  description = "expõe o servidor de API dentro da VPC"
}

variable "cidrs_do_endpoint_publico" {
  type        = list(string)
  default     = []
  description = "quem alcança o endpoint público; vazio enquanto endpoint_publico for false"

  validation {
    condition     = alltrue([for c in var.cidrs_do_endpoint_publico : can(cidrnetmask(c))])
    error_message = "Cada entrada tem que ser um CIDR IPv4 (ex.: 10.1.0.0/16)."
  }
}

variable "tipos_de_log" {
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
  description = "logs do plano de controle entregues ao CloudWatch"
}

variable "retencao_de_log_dias" {
  type        = number
  default     = 90
  description = "retenção do log group do plano de controle"
}

# Versões dos add-ons. Nulo deixa o EKS escolher o default da versão do cluster;
# fixar torna o upgrade reproduzível.
variable "versao_vpc_cni" {
  type    = string
  default = null
}

variable "versao_kube_proxy" {
  type    = string
  default = null
}

variable "versao_coredns" {
  type    = string
  default = null
}

variable "versao_ebs_csi" {
  type    = string
  default = null
}

variable "versao_efs_csi" {
  type    = string
  default = null
}

variable "versao_metrics_server" {
  type    = string
  default = null
}

variable "ipam_windows" {
  type        = bool
  default     = false
  description = <<-EOT
    Liga o IPAM de Windows no add-on vpc-cni. Só faz sentido no cluster que agenda pod
    Windows: sem ele o vpc-resource-controller não atribui endereço ao pod Windows, e o pod
    fica em laço de FailedCreatePodSandBox porque o pool quente de IP nunca enche.
  EOT
}

variable "zona_dns_externo" {
  type        = string
  default     = ""
  description = <<-EOT
    Domínio da hosted zone privada do Route53 que o external-dns administra, associada à VPC
    do cluster.

    Vazio não cria nada de external-dns: nem a zona, nem a política, nem o papel IRSA, e as
    saídas correspondentes vêm nulas. Use vazio quando o ambiente não vai rodar external-dns,
    ou quando a zona é administrada fora desta receita (aí o papel também nasce lá, escopado
    no ARN da zona que já existe).
  EOT
}

variable "familia_de_ip" {
  type        = string
  default     = "ipv4"
  description = "família de endereço dos pods e services do cluster"

  validation {
    condition     = contains(["ipv4", "ipv6"], var.familia_de_ip)
    error_message = "familia_de_ip é ipv4 ou ipv6."
  }
}

variable "grupos_que_alcancam_a_api" {
  type        = list(string)
  default     = []
  description = "grupos de segurança que falam com a API do cluster além dos nós; a máquina de operação entra por aqui"
}

variable "administradores" {
  type        = list(string)
  default     = []
  description = "identidades que administram o cluster; sem elas o único acesso é o de quem criou"
}

variable "conjuntos_que_administram" {
  type        = list(string)
  default     = []
  description = "nomes de permission set do Identity Center cujos membros administram o cluster; o ARN da role é resolvido, não digitado"
}

variable "disco_do_no_gb" {
  type        = number
  default     = 50
  description = "tamanho do disco de cada nó"

  # Cinquenta porque o default de vinte enche com cache de imagem em cluster que
  # roda mais de um serviço, e nó com disco cheio não agenda pod nem avisa
  # direito.
}

variable "percentual_indisponivel_na_subida" {
  type        = number
  default     = 50
  description = "quanto do grupo pode ficar fora ao mesmo tempo durante a troca de nós"

  # Metade porque a troca fica rápida sem deixar o cluster sem capacidade. Grupo
  # que sustenta carga sensível declara menos, e aceita demorar mais.
}

variable "tipo_de_suporte" {
  type        = string
  default     = "STANDARD"
  description = "STANDARD (a AWS atualiza no fim do suporte padrão) ou EXTENDED (segura a versão e cobra 5x a hora do plano de controle)"
  validation {
    condition     = contains(["STANDARD", "EXTENDED"], var.tipo_de_suporte)
    error_message = "tipo_de_suporte aceita STANDARD ou EXTENDED."
  }
}
