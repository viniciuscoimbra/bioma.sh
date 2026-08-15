# Organismo vpn-acesso (02·D6): a porta humana. VPN única, autorização por
# grupo, terminando numa VPC própria na faixa CGNAT (02.3: 100.64.16.0/24);
# as rotas de retorno para essa faixa entram nos planos pela associacao-tgw.
# Só não-produção: produção não tem acesso humano.

resource "aws_vpc" "terminacao" {
  cidr_block = var.cidr_terminacao
  tags       = { Name = "vpn-terminacao" }
}

resource "aws_subnet" "terminacao" {
  count = 2

  vpc_id            = aws_vpc.terminacao.id
  cidr_block        = cidrsubnet(var.cidr_terminacao, 1, count.index)
  availability_zone = var.azs[count.index]
}

resource "aws_ec2_client_vpn_endpoint" "esta" {
  description            = "acesso humano a nao-producao"
  server_certificate_arn = var.certificado_arn
  client_cidr_block      = var.cidr_clientes
  split_tunnel           = true # as rotas da tabela descem todas; autorização é controle separado (02.3)
  vpc_id                 = aws_vpc.terminacao.id

  # Duas portas para a mesma fechadura, e a instância escolhe qual usa.
  #
  # `federada` é o destino: o IdP corporativo autentica, e a autorização por
  # grupo abaixo funciona de verdade, grupo a grupo.
  #
  # `certificado` é o começo, para quem ainda não tem IdP. Cada pessoa recebe um
  # certificado de cliente emitido pela CA declarada, e revogar acesso é revogar
  # o certificado dela. O preço está nomeado como premissa: com certificado, o
  # Client VPN não conhece grupo, então a autorização vira "quem tem certificado
  # alcança este CIDR". A granularidade cai de grupo para pessoa-com-certificado,
  # e é por isso que a VPN só existe em não-produção (02·D6).
  authentication_options {
    type                       = var.autenticacao == "federada" ? "federated-authentication" : "certificate-authentication"
    saml_provider_arn          = var.autenticacao == "federada" ? var.saml_provider_arn : null
    root_certificate_chain_arn = var.autenticacao == "federada" ? null : var.ca_clientes_arn
  }

  connection_log_options {
    enabled              = true
    cloudwatch_log_group = var.log_group
  }
}

resource "aws_ec2_client_vpn_network_association" "assoc" {
  count = 2

  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.esta.id
  subnet_id              = aws_subnet.terminacao[count.index].id
}

# autorização por grupo: o /16 do domínio, nunca a supernet (02.3, walk 5)
resource "aws_ec2_client_vpn_authorization_rule" "grupo" {
  for_each = var.autorizacoes

  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.esta.id
  target_network_cidr    = each.value.cidr
  # com IdP, a regra é do grupo; sem ele, o Client VPN não conhece grupo e a
  # regra vale para quem tiver certificado. Declarar `authorize_all_groups`
  # explicitamente é melhor que deixar o argumento ausente decidir em silêncio.
  access_group_id      = var.autenticacao == "federada" ? each.value.grupo : null
  authorize_all_groups = var.autenticacao == "federada" ? null : true
  description          = each.key
}
