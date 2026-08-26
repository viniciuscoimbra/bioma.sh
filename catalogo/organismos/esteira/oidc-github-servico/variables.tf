variable "repo_servico" {
  type        = string
  description = "org/repo do serviço de aplicação (não o repo -live de infraestrutura)"
}

# GitHub passou a emitir o sub claim no formato IMUTÁVEL para repositórios
# criados a partir de 2026-07-15 (ou que optaram por migrar): o delimitador
# entre nome e ID passa a ser "@", não "/" nem ":" —
# "repo:<org>@<org_id>/<repo>@<repo_id>:environment:<nome>" em vez de
# "repo:<org>/<repo>:environment:<nome>" (github.blog/changelog/
# 2026-04-23-immutable-subject-claims-for-github-actions-oidc-tokens).
# Um repositório real já emitia nesse formato em 2026-08-21, com o sub
# saindo como "repo:<org>@<org_id>/<repo>@<repo_id>:*".
# Sem estas duas variáveis, a condição StringEquals do trust nunca casa com
# o sub real, e toda role deste organismo fica impossível de assumir —
# "not authorized to perform sts:AssumeRoleWithWebIdentity" em qualquer
# workflow, mesmo com policy de permissão correta.
variable "repo_owner_id" {
  # string, não number: só entra em interpolação de string (sub claim),
  # nunca em aritmética. Mantém como string o mesmo padrão de contas.hcl
  # (números de conta AWS também ficam como string) — assim um valor ausente
  # cai no sentinel DECLARE_* e falha com mensagem clara, em vez de
  # "tonumber(): a non-decimal-digit character" se fosse number.
  type        = string
  description = "ID numérico imutável da organização/dono do repositório (aparece no sub claim como <org>@<repo_owner_id>). Settings do repositório no GitHub, ou a própria mensagem de erro de AssumeRoleWithWebIdentity mostra o sub real."
}

variable "repo_id" {
  type        = string
  description = "ID numérico imutável do repositório (aparece no sub claim como <repo>@<repo_id>)."
}

# O provider OIDC já existe na conta (um só, criado por organismos/esteira/oidc-github
# quando a esteira de infraestrutura daquele trilho foi aplicada). Esta receita
# reaproveita por data source; recriá-lo colidiria (a AWS só aceita um provider
# por URL de emissor, por conta).
variable "oidc_provider_arn" {
  type        = string
  description = "ARN do aws_iam_openid_connect_provider já existente na conta (organismos/esteira/oidc-github)"
}

# Uma role por estágio da esteira. `ambiente_github` é o nome do Environment
# configurado no repositório do serviço (dev, homologacao, producao) — é ele
# que aparece no sub claim do token OIDC. Estágio sem Environment cai na
# condição por evento em vez de por Environment.
#
# `eventos` é LISTA, não valor único: `esteira-registro` roda em `build.yml`,
# que dispara por `pull_request` E por `push` em `main` (dois jobs, dois
# eventos, mesma role — o job de build é o mesmo nos dois casos). Um só
# `evento` cobriria a metade dos disparos e a outra metade cairia em
# "not authorized to perform AssumeRoleWithWebIdentity" sem aviso nenhum até
# alguém abrir um PR e ver o job de imagem falhar. `StringEquals` com uma
# lista em `values` já faz OR entre os sub claims (é como a AWS documenta a
# condição): não precisa de um statement por evento.
#
# `repos_adicionais` (achado em conta real, 2026-08-26): uma role
# por evento pode precisar confiar em MAIS de um repositório — o registro de
# imagem é compartilhado entre os domínios da instalação,
# então esteira-registro precisa aceitar o sub de cada repositório de serviço
# que publica imagem ali, não só de var.repo_servico (o repo "principal" da
# instância). Roles por Environment não usam este campo: um Environment do
# GitHub pertence a um repositório só, então "outro repositório" não faz
# sentido nesse caso (ambiente_github já implica repo_servico).
variable "roles" {
  type = map(object({
    ambiente_github = optional(string)
    eventos         = optional(list(string)) # usado só quando ambiente_github é null; ex.: ["pull_request", "ref:refs/heads/main"]
    repos_adicionais = optional(list(object({
      repo     = string # org/repo, ex.: "Grupo-Eagle/posting-ledger"
      owner_id = string # ID imutável da organização (mesmo formato de var.repo_owner_id)
      repo_id  = string # ID imutável do repositório (mesmo formato de var.repo_id)
    })), [])
    policy_json = string
  }))
  description = "chave = sufixo do nome da role (registro, dev, hml, prd); valor = condição de trust + policy"

  validation {
    condition = alltrue([
      for r in var.roles : (r.ambiente_github != null) != (r.eventos != null && length(r.eventos) > 0)
    ])
    error_message = "cada role declara ambiente_github OU eventos (lista não vazia), nunca os dois nem nenhum."
  }

  validation {
    condition = alltrue([
      for r in var.roles : r.ambiente_github == null || length(coalesce(r.repos_adicionais, [])) == 0
    ])
    error_message = "repos_adicionais só é válido em roles por evento (eventos); role por Environment (ambiente_github) pertence a um único repositório."
  }
}
