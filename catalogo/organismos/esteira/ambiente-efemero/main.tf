# Organismo ambiente-efemero (15·D7, 15.2 §3): a camada de aplicação que nasce
# com o pull request e morre com ele. Compõe funcao-processadora (o compute) e
# api-privada (a porta síncrona), e acrescenta o que dá nome próprio ao PR: o
# custom domain e o registro DNS.
#
# Aplicada pela ESTEIRA, nunca pelo live: o gatilho é o evento do PR, e o
# `terragrunt destroy` no encerramento é parte do contrato, não exceção.
#
# O que NÃO nasce aqui, e por quê: a VPC e o VPC endpoint execute-api são de
# vpc-dominio; a zona privada é de resolver-dns; o certificado wildcard e a CA
# privada são infra de base. Todos permanentes: o efêmero é só a aplicação.

locals {
  nome = "${var.servico}-${var.prefixo}"

  # O FQDN do ambiente: UM ÚNICO RÓTULO hifenizado (prefixo-dominio), não um
  # subdomínio aninhado (prefixo.dominio). A zona real (zona_dns_nome) é
  # genérica e compartilhada entre domínios (ex.: "dev.interno", sem prefixo
  # de domínio embutido) — um wildcard de certificado/DNS só substitui UM
  # rótulo, então "*.dev.interno" cobre "pr-123-<dominio>.dev.interno"
  # (um rótulo antes da zona) mas NÃO cobriria "pr-123.<dominio>.dev.interno"
  # (dois rótulos), que exigiria um certificado por domínio. O hífen em vez do
  # ponto é o que preserva um único certificado wildcard por ambiente
  # (design.md, Lacuna 2, decisão revisada em 2026-08-19).
  fqdn = "${var.prefixo}-${var.dominio}.${var.zona_dns_nome}"

  # As etiquetas que a esteira consulta. `preview-pr.yml` conta os vivos por
  # `efemero` para aplicar o teto, e caça órfãos por `efemero` + `prefixo`
  # (Resource Groups Tagging API). Recurso desta stack sem estas duas não é
  # encontrado pela varredura, e vira custo silencioso.
  etiquetas = {
    efemero = var.tipo
    prefixo = var.prefixo
    servico = var.servico
  }
}

# ── compute ────────────────────────────────────────────────────────────────

module "funcao" {
  source = "../../../moleculas/funcao-processadora"

  nome           = local.nome
  imagem_inicial = var.referencia_artefato

  memoria_mb         = var.memoria_mb
  timeout_s          = var.timeout_s
  retencao_log_dias  = var.retencao_log_dias
  kms_key_arn        = var.kms_key_arn
  subnet_ids         = var.subnet_ids
  security_group_ids = var.security_group_ids
  tags               = local.etiquetas

  # A env var aponta o segredo, nunca o valor (Program.cs,
  # AddAwsSecretsManager). Sem ela a aplicação .NET falha rápido no startup,
  # mesmo com toda a rede resolvida.
  #
  # Passa a apontar o ARN, e não o nome. O SecretId do SDK aceita os dois, mas
  # o ARN não é ambíguo: ele carrega conta e região, enquanto o nome depende de
  # onde a função está olhando. É também o que a esteira legada de uma
  # instalação real sempre mandou, segundo quem a operou — o arquivo não mora
  # nesta árvore e não foi conferido aqui.
  #
  # `variaveis_de_ambiente` entra por fora: quem sabe do que a aplicação
  # precisa é a instância, não esta receita (DOTNET_ENVIRONMENT e
  # Observability__ConsoleFormat são os do piloto). A chave do segredo nunca é
  # sobrescrita por ela — merge() dá a vitória ao segundo argumento.
  #
  # segredo_arn null (default) segue omitindo a chave por completo, que é o
  # smoke test de "o ambiente sobe" sem segredo nenhum aplicado.
  variaveis_de_ambiente = merge(
    var.variaveis_de_ambiente,
    var.segredo_arn == null ? {} : {
      SecretsManager__SecretId = var.segredo_arn
    }
  )
}

# A região desta instalação, para a condição de serviço da permissão de
# decifrar abaixo. Data source local no sentido que importa: a resposta vem do
# provider já configurado, e não de uma chamada que dependa de credencial de
# outra conta.
data "aws_region" "esta" {}

# Leitura do segredo da aplicação — mesmo padrão de core-banking/desembolso.
# Pula por completo quando segredo_arn é null (smoke test sem secret real).
#
# `kms:Decrypt` junto, e não só `GetSecretValue`: cofre cifrado por chave
# gerenciada pela instituição só abre para quem também pode decifrar. E a
# chave costuma morar na conta de segurança enquanto o compute mora na do
# domínio — entre contas, a key policy sozinha não basta, a política de
# identidade de quem chama precisa dizer sim também. Sem isto a leitura volta
# AccessDenied vindo do KMS, e a aplicação falha no startup com toda a rede
# resolvida: o mesmo sintoma que a env var do segredo existe para evitar.
#
# Medido numa instalação real em 2026-08-29, na receita irmã de compute
# permanente: o simulador da role da função devolvia `allowed` para
# `GetSecretValue` e `implicitDeny` para `kms:Decrypt`. Uma imagem de bootstrap
# que não lê segredo nenhum não percebe a falta — só a aplicação de verdade.
#
# Com a chave conhecida, a permissão aponta o ARN dela. Sem ela, `ViaService`
# faz o papel do recurso: a role só decifra o que o cofre decifrar por ela, e o
# QUE ela pode ler continua preso ao ARN do statement acima. Exigir a chave
# seria mais estreito e cobraria um valor novo da célula que instancia esta
# receita — que mora no repositório do serviço, fora desta árvore. Quebrar o
# preview de quem já a usa para proteger menos não é troca que se faça.
resource "aws_iam_role_policy" "le_segredo" {
  count = var.segredo_arn == null ? 0 : 1

  name = "le-segredo-aplicacao"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    # Uma lista por ramo, e não um ternário entre os dois objetos: HCL não
    # unifica objetos com atributos diferentes (um tem `Condition`, o outro
    # não), e o plano quebraria com "inconsistent conditional result types".
    # Entre listas o concat resolve sem unificar.
    Statement = concat(
      [{
        Effect   = "Allow"
        Action   = "secretsmanager:GetSecretValue"
        Resource = var.segredo_arn
      }],
      var.kms_key_arn == null ? [] : [{
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = var.kms_key_arn
      }],
      var.kms_key_arn != null ? [] : [{
        Effect   = "Allow"
        Action   = "kms:Decrypt"
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.${data.aws_region.esta.region}.amazonaws.com"
          }
        }
      }],
    )
  })
}

# Decifrar a camada da imagem no pull: a função por imagem puxa do registro da
# conta da esteira, cifrado pela chave daquela conta, e sem esta permissão o
# CreateFunction falha ao decifrar mesmo com a key policy liberando o
# principal de outra conta. As duas pontas do KMS entre contas precisam dizer
# sim, e esta é a da role de execução.
#
# O ARN da chave vem de quem dispara, porque a receita não conhece a conta da
# esteira. Nulo é o caso de quem publica imagem sem cifra própria (o registro
# na mesma conta, com a chave gerenciada da AWS): aí a permissão não é
# necessária e não nasce, em vez de o apply quebrar pedindo um valor que não
# existe naquela instalação.
resource "aws_iam_role_policy" "decrypt_ecr" {
  count = var.chave_do_registro_arn == null ? 0 : 1

  name = "decrypt-imagem-ecr"
  role = module.funcao.permissao_nome

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "kms:Decrypt",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ]
      Resource = var.chave_do_registro_arn
    }]
  })
}

# O alias é o alvo estável da integração: a esteira troca a versão por baixo
# sem reescrever a rota. Também é o que SnapStart exigiria no modo Zip, que não
# roda em $LATEST (https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html).
resource "aws_lambda_alias" "este" {
  name             = var.tipo
  function_name    = module.funcao.nome_da_funcao
  function_version = "$LATEST"

  lifecycle {
    # a esteira publica versão nova a cada promoção e reaponta o alias
    ignore_changes = [function_version]
  }
}

# ── porta síncrona ─────────────────────────────────────────────────────────

module "api" {
  source = "../../../moleculas/api-privada"

  nome            = local.nome
  vpc_endpoint_id = var.vpc_endpoint_id
  tags            = local.etiquetas
}

# Rota coringa. A aplicação é uma app ASP.NET hospedada em Lambda, que roteia
# por dentro (Arquitetura de Produto .NET §3): a API precisa entregar qualquer
# caminho e método à função, não espelhar as rotas do serviço.
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = module.api.api_id
  parent_id   = module.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = module.api.api_id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = var.autorizacao
}

# A raiz também, senão GET / cai fora do coringa e devolve 403.
resource "aws_api_gateway_method" "raiz" {
  rest_api_id   = module.api.api_id
  resource_id   = module.api.root_resource_id
  http_method   = "ANY"
  authorization = var.autorizacao
}

resource "aws_api_gateway_integration" "proxy" {
  rest_api_id = module.api.api_id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method

  # AWS_PROXY entrega o request inteiro à função e devolve a resposta dela;
  # integração é sempre POST para o Lambda, independente do método da rota.
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_alias.este.invoke_arn
}

resource "aws_api_gateway_integration" "raiz" {
  rest_api_id             = module.api.api_id
  resource_id             = module.api.root_resource_id
  http_method             = aws_api_gateway_method.raiz.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_alias.este.invoke_arn
}

# Sem esta permissão a API recebe 500 do Lambda: o alias precisa admitir a
# invocação vinda desta API, e o source_arn limita a ela.
resource "aws_lambda_permission" "api" {
  statement_id  = "permite-api-gateway"
  action        = "lambda:InvokeFunction"
  function_name = module.funcao.nome_da_funcao
  qualifier     = aws_lambda_alias.este.name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api.execution_arn}/*/*/*"
}

resource "aws_api_gateway_deployment" "este" {
  rest_api_id = module.api.api_id

  # O deployment não observa mudança de rota sozinho. O gatilho amarra o
  # redeploy ao que de fato mudou; sem ele, alterar a integração não publica.
  triggers = {
    redeploy = sha1(jsonencode([
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy.id,
      aws_api_gateway_method.raiz.id,
      aws_api_gateway_integration.proxy.id,
      aws_api_gateway_integration.raiz.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# O registro do que passou pela porta, e o rastro de onde a chamada foi parar.
#
# Nasce AQUI e não na célula porque este ambiente nasce sozinho, a cada PR, sem
# ninguém revisando o que ele cria: configuração que depende de alguém lembrar
# não existe em recurso efêmero. Os dois controles que cobravam isso (o log de
# execução e o rastreamento) reprovavam justamente o stage `preview`, que é o
# único que ninguém escreve à mão.
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${var.prefixo}-${var.tipo}"
  retention_in_days = var.dias_de_log_da_api
  kms_key_id        = var.kms_key_arn
  tags              = local.etiquetas
}

resource "aws_api_gateway_stage" "este" {
  rest_api_id   = module.api.api_id
  deployment_id = aws_api_gateway_deployment.este.id
  stage_name    = var.tipo
  tags          = local.etiquetas

  # O rastreamento custa por trecho amostrado e some junto com o ambiente. Num
  # efêmero que vive horas, o preço é de horas; o que ele responde é a pergunta
  # que só aparece no preview, que é onde a chamada morreu.
  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationErr = "$context.integration.error"
    })
  }
}

# ── nome próprio do PR ─────────────────────────────────────────────────────

# O custom domain é EFÊMERO: nasce e morre com o PR, igual ao registro DNS.
# Um domínio que sobrevivesse ao PR viraria órfão e quebraria a garantia do
# efêmero. O certificado que ele referencia é permanente: um wildcard
# `*.<zona>` emitido pela CA privada cobre todos os prefixos, e não é
# reemitido por PR.
resource "aws_api_gateway_domain_name" "este" {
  domain_name = local.fqdn
  # `regional_certificate_arn` só é válido para endpoint REGIONAL/EDGE; um
  # domínio PRIVATE (abaixo) exige `certificate_arn` — API rejeita com
  # "RegionalCertificateArn is not supported for PRIVATE custom domain name"
  # caso contrário.
  certificate_arn = var.certificado_wildcard_arn
  security_policy = "TLS_1_2"
  tags            = local.etiquetas

  endpoint_configuration {
    types = ["PRIVATE"]
  }
}

# Quem pode invocar este domínio: só quem chega pelo VPC endpoint do ambiente.
# É o mesmo controle que a policy da api-privada aplica, na camada do domínio.
resource "aws_api_gateway_domain_name_access_association" "esta" {
  domain_name_arn                = aws_api_gateway_domain_name.este.arn
  access_association_source      = var.vpc_endpoint_id
  access_association_source_type = "VPCE"
  tags                           = local.etiquetas
}

# Domínio PRIVATE não é resolvido só pelo domain_name: diferente de
# REGIONAL/EDGE, um custom domain PRIVATE pode ter o mesmo domain_name em
# associações distintas, então a API exige domain_name_id para desambiguar
# qual domínio de fato mapear. Sem ele, CreateBasePathMapping reprova com
# "Invalid domain name identifier specified" mesmo com o domain_name certo
# (hashicorp/terraform-provider-aws#41659, mesmo achado real neste PR).
resource "aws_api_gateway_base_path_mapping" "este" {
  api_id         = module.api.api_id
  stage_name     = aws_api_gateway_stage.este.stage_name
  domain_name    = aws_api_gateway_domain_name.este.domain_name
  domain_name_id = aws_api_gateway_domain_name.este.domain_name_id
}

# Para onde o nome resolve. Numa API privada o tráfego chega pelo VPC endpoint
# execute-api, então é o DNS dele que responde por este nome — não um domínio
# regional público. O endpoint é permanente e vem por input; aqui só se lê.
data "aws_vpc_endpoint" "execute_api" {
  id = var.vpc_endpoint_id
}

locals {
  # dns_entry é uma lista (uma entrada por AZ mais a regional). A primeira serve
  # como alvo do alias: o Route53 resolve para os IPs privados das ENIs.
  endpoint_dns = tolist(data.aws_vpc_endpoint.execute_api.dns_entry)[0]
}

# O registro na zona privada permanente. Route53 não etiqueta registro, então
# este recurso não aparece na varredura por etiqueta: a limpeza o localiza pelo
# padrão do nome dentro da zona (ver organismos/esteira/limpeza-efemero).


# A zona do ambiente mora na conta de rede, não na conta onde o efêmero sobe:
# escrever o registro exige assumir papel lá. O ARN entra por variável, porque
# número de conta não mora em organismo; a região herda do ambiente do runner
# (AWS_REGION), que o workflow já exporta.
provider "aws" {
  alias = "dns"

  assume_role {
    role_arn     = var.papel_dns_arn
    session_name = "efemero-dns"
  }
}

resource "aws_route53_record" "este" {
  provider = aws.dns
  zone_id  = var.zona_dns_id
  name     = local.fqdn
  type     = "A"

  alias {
    name                   = local.endpoint_dns.dns_name
    zone_id                = local.endpoint_dns.hosted_zone_id
    evaluate_target_health = false
  }
}
