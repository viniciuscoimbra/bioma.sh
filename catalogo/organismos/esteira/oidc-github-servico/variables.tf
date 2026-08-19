variable "repo_servico" {
  type        = string
  description = "org/repo do serviço de aplicação (não o repo -live de infraestrutura)"
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
variable "roles" {
  type = map(object({
    ambiente_github = optional(string)
    eventos         = optional(list(string)) # usado só quando ambiente_github é null; ex.: ["pull_request", "ref:refs/heads/main"]
    policy_json     = string
  }))
  description = "chave = sufixo do nome da role (registro, dev, hml, prd); valor = condição de trust + policy"

  validation {
    condition = alltrue([
      for r in var.roles : (r.ambiente_github != null) != (r.eventos != null && length(r.eventos) > 0)
    ])
    error_message = "cada role declara ambiente_github OU eventos (lista não vazia), nunca os dois nem nenhum."
  }
}
