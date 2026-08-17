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

  # O FQDN do ambiente. A zona é permanente e o rótulo é o prefixo: é isso que
  # torna a URL previsível sem que a zona nasça e morra com o PR.
  fqdn = "${var.prefixo}.${var.zona_dns_nome}"

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

resource "aws_api_gateway_stage" "este" {
  rest_api_id   = module.api.api_id
  deployment_id = aws_api_gateway_deployment.este.id
  stage_name    = var.tipo
  tags          = local.etiquetas
}

# ── nome próprio do PR ─────────────────────────────────────────────────────

# O custom domain é EFÊMERO: nasce e morre com o PR, igual ao registro DNS.
# Um domínio que sobrevivesse ao PR viraria órfão e quebraria a garantia do
# efêmero. O certificado que ele referencia é permanente: um wildcard
# `*.<zona>` emitido pela CA privada cobre todos os prefixos, e não é
# reemitido por PR.
resource "aws_api_gateway_domain_name" "este" {
  domain_name              = local.fqdn
  regional_certificate_arn = var.certificado_wildcard_arn
  security_policy          = "TLS_1_2"
  tags                     = local.etiquetas

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

resource "aws_api_gateway_base_path_mapping" "este" {
  api_id      = module.api.api_id
  stage_name  = aws_api_gateway_stage.este.stage_name
  domain_name = aws_api_gateway_domain_name.este.domain_name
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
resource "aws_route53_record" "este" {
  zone_id = var.zona_dns_id
  name    = local.fqdn
  type    = "A"

  alias {
    name                   = local.endpoint_dns.dns_name
    zone_id                = local.endpoint_dns.hosted_zone_id
    evaluate_target_health = false
  }
}
