# Organismo inspecao-egress (02·D1): toda saída passa pelo firewall central.
# VPC de inspeção na faixa CGNAT, appliance mode no attachment (assimetria de
# AZ mata sessão stateful, 02.3), NAT para a internet depois da inspeção.

resource "aws_vpc" "inspecao" {
  cidr_block = var.cidr_inspecao
  tags       = { Name = "inspecao-${var.plano}" }
}

# Nada nesta VPC usa o grupo de fábrica: o firewall tem placas próprias e o NAT
# não usa grupo. Fica vazio para não ser caminho para nada — e para que a
# próxima peça que subir sem grupo declarado falhe em vez de herdar passagem.
resource "aws_default_security_group" "vazio" {
  vpc_id = aws_vpc.inspecao.id

  tags = { Name = "default-vazio-inspecao" }
}

resource "aws_subnet" "firewall" {
  count = 3

  vpc_id            = aws_vpc.inspecao.id
  cidr_block        = cidrsubnet(var.cidr_inspecao, 3, count.index)
  availability_zone = var.azs[count.index]
  tags              = { Name = "fw-${count.index}" }
}

resource "aws_subnet" "nat" {
  count = 3

  vpc_id                  = aws_vpc.inspecao.id
  cidr_block              = cidrsubnet(var.cidr_inspecao, 3, count.index + 3)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = false
  tags                    = { Name = "nat-${count.index}" }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "inspecao" {
  transit_gateway_id     = var.tgw_id
  vpc_id                 = aws_vpc.inspecao.id
  subnet_ids             = aws_subnet.tgw[*].id
  appliance_mode_support = "enable"
  tags                   = { Name = "inspecao-${var.plano}", plano = var.plano }
}

resource "aws_networkfirewall_firewall_policy" "politica" {
  name = "egress-${var.plano}"

  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]

    # A postura é do operador, e não desta receita: nem toda instituição que usa
    # este catálogo tem regulador exigindo bloqueio por padrão. Quem exige,
    # declara em `convencoes.json` e o verificador cobra; aqui só existe o botão.
    #
    # `drop` precisa de STRICT_ORDER: sem ordem estrita a AWS não aceita
    # `stateful_default_actions`, e a política sobe passando tudo com cara de
    # bloqueio.
    dynamic "stateful_engine_options" {
      for_each = var.postura_default == "drop" ? [1] : []
      content {
        rule_order = "STRICT_ORDER"
      }
    }
    # Onde o drop morde muda se a allowlist é de domínio. `aws:drop_strict`
    # derruba todo pacote que não casou, e o handshake TCP é um deles: a
    # conexão morre antes do TLS, o firewall nunca lê o SNI, e a allowlist de
    # domínio não chega a casar nada. A AWS recomenda `drop established` para
    # ordem estrita com grupo de lista de domínio, justamente por isso.
    stateful_default_actions = (var.postura_default != "drop" ? [] :
      var.bloqueio == "conexao"
      ? ["aws:drop_established", "aws:alert_established"]
    : ["aws:drop_strict", "aws:alert_strict"])

    # Com STRICT_ORDER a AWS exige prioridade em cada grupo, e o provider não:
    # o Terraform aceita a configuração e a API recusa no apply. A ordem da
    # lista é a prioridade, que é o que quem escreve a allowlist espera.
    dynamic "stateful_rule_group_reference" {
      for_each = var.grupos_de_regra_arns
      content {
        resource_arn = stateful_rule_group_reference.value
        priority     = var.postura_default == "drop" ? stateful_rule_group_reference.key + 1 : null
      }
    }
  }
}

resource "aws_networkfirewall_firewall" "este" {
  name                = "egress-${var.plano}"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.politica.arn
  vpc_id              = aws_vpc.inspecao.id

  dynamic "subnet_mapping" {
    for_each = aws_subnet.firewall[*].id
    content {
      subnet_id = subnet_mapping.value
    }
  }
}

# ── a saída, que faltava ───────────────────────────────────────────────────
#
# O topo deste arquivo prometia "NAT para a internet depois da inspeção" e o
# organismo parava no firewall: as sub-redes de NAT nasciam vazias, sem gateway
# de internet, sem NAT e sem rota. A célula aplicava dez recursos, o firewall
# ficava READY, e nenhum pacote saía. Achado em 2026-08-14, no apply.
#
# O caminho é o dos modelos de implantação do Network Firewall (saída
# centralizada), e ele passa pelo endpoint do firewall nos dois sentidos:
#
#   spoke -> TGW -> sub-rede do attachment -> endpoint -> NAT -> IGW -> internet
#   internet -> IGW -> NAT -> endpoint -> TGW -> spoke
#
# Por isso o attachment sai das sub-redes do firewall e ganha as próprias: com
# os dois na mesma sub-rede, a rota não tem como mandar o tráfego ao endpoint
# antes de sair, e a inspeção vira enfeite.

resource "aws_subnet" "tgw" {
  count = 3

  vpc_id = aws_vpc.inspecao.id
  # A faixa já está dividida em oito blocos de três bits: os índices 0 a 2 são
  # do firewall e 3 a 5 do NAT, e sobram dois. As três sub-redes do attachment
  # entram como /25 dentro deles (índices 12, 13 e 14 de quatro bits), porque
  # attachment de transit gateway usa um endereço por zona e não precisa de
  # mais. Mudar a divisão dos outros seis recriaria o firewall que já está de
  # pé.
  cidr_block        = cidrsubnet(var.cidr_inspecao, 4, count.index + 12)
  availability_zone = var.azs[count.index]
  tags              = { Name = "tgw-${count.index}" }
}

resource "aws_internet_gateway" "este" {
  vpc_id = aws_vpc.inspecao.id
  tags   = { Name = "inspecao-${var.plano}" }
}

resource "aws_eip" "nat" {
  count  = 3
  domain = "vpc"
  tags   = { Name = "nat-${count.index}" }
}

# Um por zona: NAT é zonal, e um só faz o tráfego das outras duas atravessar
# zona para sair, com custo e com ponto único de falha.
resource "aws_nat_gateway" "este" {
  count = 3

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.nat[count.index].id
  tags          = { Name = "nat-${count.index}" }

  depends_on = [aws_internet_gateway.este]
}

# endpoint do firewall por zona, do estado do próprio recurso
locals {
  endpoint_por_az = {
    for s in tolist(aws_networkfirewall_firewall.este.firewall_status[0].sync_states) :
    s.availability_zone => tolist(s.attachment)[0].endpoint_id
  }
}

resource "aws_route_table" "tgw" {
  count  = 3
  vpc_id = aws_vpc.inspecao.id
  tags   = { Name = "rt-tgw-${count.index}" }
}

resource "aws_route" "tgw_para_firewall" {
  count = 3

  route_table_id         = aws_route_table.tgw[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  vpc_endpoint_id        = local.endpoint_por_az[var.azs[count.index]]
}

resource "aws_route_table_association" "tgw" {
  count = 3

  subnet_id      = aws_subnet.tgw[count.index].id
  route_table_id = aws_route_table.tgw[count.index].id
}

resource "aws_route_table" "firewall" {
  count  = 3
  vpc_id = aws_vpc.inspecao.id
  tags   = { Name = "rt-fw-${count.index}" }
}

resource "aws_route" "firewall_para_nat" {
  count = 3

  route_table_id         = aws_route_table.firewall[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.este[count.index].id
}

resource "aws_route" "firewall_para_tgw" {
  count = 3

  route_table_id         = aws_route_table.firewall[count.index].id
  destination_cidr_block = var.supernet_interna
  transit_gateway_id     = var.tgw_id

  depends_on = [aws_ec2_transit_gateway_vpc_attachment.inspecao]
}

resource "aws_route_table_association" "firewall" {
  count = 3

  subnet_id      = aws_subnet.firewall[count.index].id
  route_table_id = aws_route_table.firewall[count.index].id
}

resource "aws_route_table" "nat" {
  count  = 3
  vpc_id = aws_vpc.inspecao.id
  tags   = { Name = "rt-nat-${count.index}" }
}

resource "aws_route" "nat_para_internet" {
  count = 3

  route_table_id         = aws_route_table.nat[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.este.id
}

# A volta também inspecionada: o que retorna da internet entra no endpoint
# antes de voltar ao hub.
resource "aws_route" "nat_para_firewall" {
  count = 3

  route_table_id         = aws_route_table.nat[count.index].id
  destination_cidr_block = var.supernet_interna
  vpc_endpoint_id        = local.endpoint_por_az[var.azs[count.index]]
}

resource "aws_route_table_association" "nat" {
  count = 3

  subnet_id      = aws_subnet.nat[count.index].id
  route_table_id = aws_route_table.nat[count.index].id
}
