# ── identidade do efêmero ──────────────────────────────────────────────────

variable "prefixo" {
  type        = string
  description = "identificador do ambiente: pr-123 no preview, rc-45 na homologação"

  validation {
    # O prefixo entra em nome de recurso e em rótulo DNS. Rótulo DNS aceita
    # letra, dígito e hífen, não começa nem termina com hífen, e o teto de 40
    # deixa folga para os sufixos que as receitas acrescentam.
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$", var.prefixo))
    error_message = "prefixo deve ser um rótulo DNS válido em minúsculas (ex.: pr-123, rc-45), até 40 caracteres."
  }
}

variable "tipo" {
  type        = string
  description = "preview (por PR, na conta dev) ou homologacao (por candidato, na conta hml)"

  validation {
    condition     = contains(["preview", "homologacao"], var.tipo)
    error_message = "tipo aceita apenas preview ou homologacao."
  }
}

variable "servico" {
  type        = string
  description = "nome do serviço a que este ambiente pertence, usado na composição dos nomes"
}

variable "dominio" {
  type        = string
  description = <<-EOF
    domínio de negócio, composto no FQDN junto do
    prefixo (pr-123-<dominio>.<zona>) para isolar domínios dentro da
    mesma zona DNS privada compartilhada (design.md, Lacuna 2). Rótulo
    único hifenizado, não subdomínio: um wildcard só cobre um rótulo, e a
    zona real é genérica por ambiente, não por domínio.
  EOF

  validation {
    condition     = can(regex("^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$", var.dominio))
    error_message = "dominio deve ser um rótulo DNS válido em minúsculas (letras, dígitos e hífen), até 40 caracteres."
  }
}

# ── o artefato ─────────────────────────────────────────────────────────────
# funcao-processadora nasce só por imagem (decisão do Vinicius, commit
# 4cf73cb: o artefato da esteira é a imagem escaneada no ECR; zip não passa
# por registro nem por scan). O efêmero segue a mesma regra por paridade
# (15·D7): não introduz um segundo caminho de empacotamento que dev e prd não
# têm. Referência sempre por digest, nunca por tag móvel (15·D6).

variable "referencia_artefato" {
  type        = string
  description = "a imagem por digest (repo@sha256:...), publicada pelo build no ECR"
}

# ── coordenadas da infra de base ───────────────────────────────────────────
# Nada aqui é criado por esta receita: vem por dependency das células de base
# da mesma conta, ou por SSM quando a leitura cruza conta (o caso do KMS).

variable "vpc_endpoint_id" {
  type        = string
  description = "VPC endpoint execute-api, de vpc-dominio.execute_api_endpoint_id"
}

variable "subnet_ids" {
  type    = list(string)
  default = []
}

variable "security_group_ids" {
  type    = list(string)
  default = []
}

variable "zona_dns_id" {
  type        = string
  description = "zona privada do ambiente, de resolver-dns.zone_ids[<ambiente>]"
}

variable "zona_dns_nome" {
  type        = string
  description = "nome da zona privada (ex.: <dominio>.<ambiente>.interno), que compõe o FQDN do prefixo"
}

variable "certificado_wildcard_arn" {
  type        = string
  description = "certificado *.<zona> emitido pela CA privada; permanente, referenciado e nunca criado aqui"
}

variable "kms_key_arn" {
  type        = string
  default     = null
  description = "chave do domínio, por SSM da conta de segurança; cifra o log group"
}

# Achado ao inspecionar o Program.cs do serviço piloto de uma instalação: a
# aplicação .NET falha rápido no startup se não achar o Secrets Manager
# configurado (AddAwsSecretsManager(SecretsManager:SecretId)) — sem estas duas
# variáveis, nenhum preview sobe respondendo, mesmo com toda a rede resolvida.
# O CONTEÚDO do secret (connection string, certificado Lydians) não é
# responsabilidade deste organismo — é lido de fora (dominio-base/segredo-servico).
variable "segredo_arn" {
  type        = string
  default     = null
  description = "ARN do segredo da aplicação (dominio-base/segredo-servico), para a policy de leitura; null pula a policy (útil para smoke test sem conexão real a banco/fontes)"
}

variable "segredo_nome" {
  type        = string
  default     = null
  description = "nome do segredo (não o ARN), para a env var SecretsManager__SecretId; null pula a env var"
}

# ── porte e retenção ───────────────────────────────────────────────────────

variable "memoria_mb" {
  type    = number
  default = 512
}

variable "timeout_s" {
  type    = number
  default = 60
}

variable "retencao_log_dias" {
  type        = number
  default     = 7
  description = "curto de propósito: o ambiente morre com o PR, o log não deve sobreviver muito a ele"
}

# ── autorização da rota ────────────────────────────────────────────────────
# Decisão de controle, e ela é deliberada. O pôster da anatomia diz que quem
# testa "entra pela VPN com autorização por grupo e abre a URL": é navegador
# humano, e navegador não assina requisição com SigV4. Com AWS_IAM na rota, a
# URL do preview não abre — o fluxo de aceite descrito na arquitetura deixa de
# funcionar.
#
# O controle do efêmero, então, é de REDE e não de assinatura, em quatro
# camadas que já existem: a API é PRIVATE (sem rota pública); a resource policy
# da api-privada só admite o VPC endpoint do ambiente; o custom domain tem
# associação restrita ao mesmo endpoint; e a VPN só autoriza o grupo do domínio
# naquele plano. Nada de efêmero é alcançável da internet.
#
# Quem quiser exigir SigV4 troca para AWS_IAM aqui, sabendo que o acesso por
# navegador passa a precisar de um proxy assinante.
variable "autorizacao" {
  type        = string
  default     = "NONE"
  description = "NONE (controle por rede, permite navegador) ou AWS_IAM (exige SigV4)"

  validation {
    condition     = contains(["NONE", "AWS_IAM"], var.autorizacao)
    error_message = "autorizacao aceita apenas NONE ou AWS_IAM."
  }
}
