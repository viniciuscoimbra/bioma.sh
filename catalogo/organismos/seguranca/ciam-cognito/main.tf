# Organismo ciam-cognito (03·D7): o provedor de identidade do cliente final.
# Login, MFA, sessão e recuperação de acesso de quem é cliente do banco, na OU
# CIAM sob Security, em conta própria por ambiente.
#
# Por que Cognito e não um equivalente, decidido em 2026-08-10:
#
#   Residência. O cadastro do cliente final é dado pessoal sob a régua do BACEN
#     e da LGPD, e a premissa de residência deste desenho o quer na região
#     contratada. Auth0 e Okta são SaaS fora desse perímetro, e pôr login, MFA
#     e sessão do cliente final fora da nuvem contratada abre uma conversa
#     regulatória que a arquitetura não precisa ter agora.
#
#   Superfície de operação. Keycloak devolve o controle e cobra a operação de
#     um sistema de identidade: alta disponibilidade, patch, rotação de chave,
#     plantão. É a última coisa que um time em modernização deve assumir.
#
#   Custo de saída, declarado como premissa e não escondido. O Cognito não
#     exporta hash de senha, então trocar depois exige migração preguiçosa
#     (autentica no antigo na primeira vez, grava no novo) ou recadastro. O
#     preço é esse, e ele é pequeno aqui porque o CIAM já mora em OU própria com
#     contas próprias: a superfície a trocar é uma, e não está misturada.

resource "aws_cognito_user_pool" "clientes" {
  name = "ciam-${var.ambiente}"

  # Premissa CIAM-1 (dono: a segurança da instituição; revisar a cada release do
  # provedor AWS). Segundo fator obrigatório, TOTP, com o aplicativo do canal no
  # papel de autenticador. Decidido em 2026-08-10.
  #
  #   Por que obrigatório: a régua do BACEN pede autenticação forte no acesso do
  #     cliente, e senha sozinha não sustenta essa régua.
  #
  #   Por que SMS fica de fora: SIM swap é o vetor conhecido de tomada de conta
  #     no Brasil. Um fator que o atacante consegue na operadora não protege
  #     ninguém.
  #
  #   Por que TOTP não tranca o cliente do lado de fora: o aplicativo do canal
  #     registra o segredo (AssociateSoftwareToken, VerifySoftwareToken) e o
  #     guarda no keystore do aparelho. O cliente não precisa instalar
  #     autenticador de terceiro, e o fator nasce junto com a conta. O CONTRATO.md
  #     desta receita cobra isso do time do canal.
  #
  #   Por que OTP por e-mail não entra como segundo fator: o Cognito recusa MFA
  #     por e-mail num pool cuja recuperação de conta é só e-mail, e a recuperação
  #     aqui é e-mail. Liberar o e-mail para MFA exigiria levar a recuperação para
  #     `admin_only` (todo esquecimento de senha vira chamado no suporte) ou para
  #     SMS (o SIM swap que acabamos de recusar). Além disso poria os dois fatores
  #     na mesma caixa postal.
  #
  #   O que fica assumido, e é o preço desta decisão: cliente sem aparelho capaz
  #     de TOTP depende de cadastro assistido, e perda do aparelho depende do rito
  #     administrativo (AdminSetUserMFAPreference com identificação humana). Não
  #     existe desvio self-service do segundo fator, porque um desvio
  #     self-service vira o fator.
  #
  #   Para onde isso caminha: passkey com verificação de usuário satisfaz o MFA
  #     como primeiro fator quando WebAuthnConfiguration.FactorConfiguration é
  #     MULTI_FACTOR_WITH_USER_VERIFICATION. O provedor AWS 6.x expõe
  #     `web_authn_configuration` sem esse campo, então declarar passkey aqui hoje
  #     seria declarar um desenho que o Terraform não sustenta.
  mfa_configuration = "ON"

  software_token_mfa_configuration {
    enabled = true
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 1
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # o e-mail confirma a conta e é o canal de recuperação. Por isso ele não pode
  # ser também o segundo fator (premissa CIAM-1), e o telefone não entra nem numa
  # coisa nem na outra
  auto_verified_attributes = ["email"]

  # avaliação de risco a cada login: com um só fator self-service, é ela que pega
  # a sessão que veio de lugar improvável. Sobe o pool para o plano Plus, cobrado
  # por usuário ativo, e essa é a contrapartida de custo da premissa CIAM-1.
  user_pool_add_ons {
    advanced_security_mode = var.ambiente == "prd" ? "ENFORCED" : "AUDIT"
  }

  # Rito de descomissionamento, três atos nesta ordem. A trava é dupla de
  # propósito: `deletion_protection` recusa a exclusão na AWS venha ela de onde
  # vier, `prevent_destroy` derruba o plan antes de qualquer chamada de API.
  #
  #   1. Migrar o cadastro antes de tudo. O pool não exporta hash de senha, então
  #      destruir sem a migração preguiçosa no ar tira o cliente do acesso.
  #   2. Passar `descomissionando = true` na célula e aplicar. Sai a trava da
  #      AWS, o pool continua de pé, e o ato fica no diff da célula que está sendo
  #      desligada.
  #   3. Tirar `prevent_destroy` daqui, em commit próprio e revisado, e só então
  #      destruir a célula. `prevent_destroy` não aceita variável (o Terraform
  #      exige literal), então este ato mexe na receita compartilhada e a revisão
  #      é a compensação.
  #
  # Fora dessa ordem o plan falha, que é o comportamento desejado.
  deletion_protection = var.descomissionando ? "INACTIVE" : "ACTIVE"

  lifecycle {
    prevent_destroy = true
  }

  tags = { dominio = "ciam", ambiente = var.ambiente }
}

# O canal fala OIDC com o pool. Sem segredo no cliente: o app público não
# guarda segredo que se possa extrair do binário.
#
# PKCE é obrigação do aplicativo, não do pool. O Cognito aceita
# `code_challenge_method=S256` e `code_challenge` no `/oauth2/authorize`, trata os
# dois como opcionais e não oferece chave para exigi-los: não existe argumento de
# PKCE em `aws_cognito_user_pool_client` porque não existe campo na API do
# Cognito. Um app público que pede `code` sem PKCE entrega o código de
# autorização a quem interceptar o retorno. O CONTRATO.md desta receita cobra do
# time do canal: S256 sempre (o Cognito recusa `plain`), verifier só na memória do
# processo, e callback em https de domínio verificado, nunca esquema próprio, que
# outro aplicativo do mesmo aparelho pode reivindicar.
#
# O que a receita consegue declarar é o cerco em volta: fluxo só `code`, sem
# segredo, callbacks um a um, sessão de desafio curta, refresh token de uso único.
resource "aws_cognito_user_pool_client" "canal" {
  name         = "canal-${var.ambiente}"
  user_pool_id = aws_cognito_user_pool.clientes.id

  generate_secret                      = false
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]
  callback_urls                        = var.callbacks
  logout_urls                          = var.logouts

  # fluxo implícito e senha direta ficam fora: o primeiro devolve token na URL,
  # o segundo faz o canal ver a senha do cliente
  explicit_auth_flows = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  # a tela de login responde igual para usuário que existe e usuário que não
  # existe: sem isso o pool vira lista de clientes para quem quiser enumerar
  prevent_user_existence_errors = "ENABLED"

  # sem isso a saída do canal não alcança o refresh token que já foi emitido
  enable_token_revocation = true

  # menor janela que o Cognito aceita (minutos) para a sessão de desafio de MFA e
  # troca de senha: é o tempo em que um token de sessão roubado ainda serve
  auth_session_validity = 3

  # rotação de uso único. O prêmio de um app público é o refresh token, e sem
  # PKCE o pool não impede que ele seja emitido para quem interceptou o código.
  # Rotacionado, ele vale uma vez, e o reuso derruba a família inteira de tokens.
  refresh_token_rotation {
    feature                    = "ENABLED"
    retry_grace_period_seconds = 0
  }

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

# Onde o cliente vê a tela de login. O domínio próprio evita a marca da nuvem
# aparecer na barra de endereço do cliente final.
resource "aws_cognito_user_pool_domain" "porta" {
  domain       = var.dominio_login
  user_pool_id = aws_cognito_user_pool.clientes.id
}
data "aws_region" "esta" {}
