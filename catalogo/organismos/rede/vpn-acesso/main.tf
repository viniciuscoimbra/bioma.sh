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

  authentication_options {
    type              = "federated-authentication"
    saml_provider_arn = var.saml_provider_arn
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
  access_group_id        = each.value.grupo_id
  description            = each.key
}
