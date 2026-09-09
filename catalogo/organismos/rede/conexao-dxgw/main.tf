# Organismo conexao-dxgw: o caminho até uma rede alcançada por Direct Connect
# Gateway de terceiro. Irmão de conexao-corporativa, que é o mesmo papel por
# VPN; aqui o circuito é físico e o gateway é de outra conta.
#
# Por que um Transit Gateway PRÓPRIO, e não o hub: a AWS não roteia tráfego
# que entra por peering de TGW para attachment de Direct Connect Gateway — o
# que vem do peering só alcança attachment de VPC e de VPN. E a associação
# direta do hub ao DXGW é recusada quando os dois compartilham ASN (o hub usa
# 64512, que é o default da AWS dos dois lados). Provado em 2026-08-21, nos
# dois desenhos: com peering, BGP de pé, rotas aprendidas e zero pacote
# entregue; com TGW dedicado na conta do domínio, ida e volta. A decisão de
# arquitetura está em docs/pendencias-da-referencia.md.
#
# O que este organismo NÃO cria: a associação do DXGW ao TGW. Ela tem duas
# pontas, e a outra é de terceiro — a proposta sai daqui por chamada (está no
# runbook do passo 4), e o aceite é ato do dono do DXGW, fora da Organization.
# O attachment que o aceite materializa aparece neste TGW sem ser gerido; as
# rotas da rede de lá chegam por BGP e são propagadas, não escritas. A
# fronteira `rtm-banco-central` do catálogo registra essa contraparte.

data "aws_availability_zones" "estas" { state = "available" }

locals {
  zonas = slice(sort(data.aws_availability_zones.estas.names), 0, 3)
}

resource "aws_ec2_transit_gateway" "este" {
  description     = "conexao ${var.nome} (${var.dominio}-${var.ambiente})"
  amazon_side_asn = var.asn

  # Diferente do hub, e de propósito: este TGW tem UM vizinho de cada lado, e
  # a tabela default com associação e propagação ligadas é o desenho inteiro.
  # Planos de rota aqui seriam cerimônia sem decisão.
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  auto_accept_shared_attachments  = "disable"

  tags = { Name = "tgw-${var.nome}-${var.dominio}-${var.ambiente}" }

  # O aceite da associação na conta do terceiro não se refaz por apply: perder
  # este TGW é reabrir um trâmite com gente de fora.
  lifecycle { prevent_destroy = true }
}

# Sub-redes próprias para o attachment, e não as do hub: a mesma sub-rede não
# serve a dois attachments de VPC, e o encaixe desta conexão não pode disputar
# lugar com o encaixe do hub. Três /28, uma por zona, como as do hub.
resource "aws_subnet" "tgw" {
  count = 3

  vpc_id            = var.vpc_id
  cidr_block        = var.cidrs_tgw[count.index]
  availability_zone = local.zonas[count.index]
  tags              = { Name = "${var.dominio}-${var.ambiente}-tgw-${var.nome}-${count.index}" }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "este" {
  transit_gateway_id = aws_ec2_transit_gateway.este.id
  vpc_id             = var.vpc_id
  subnet_ids         = aws_subnet.tgw[*].id
  tags               = { Name = "${var.dominio}-${var.ambiente}-${var.nome}" }
}

# A rota de ida, na tabela de cada camada que fala com a rede de lá. A tabela
# chega por output da vpc-dominio (route_table_ids_por_camada), nunca por
# `rtb-` digitado; a volta é propagada por BGP e não se escreve.
resource "aws_route" "para_la" {
  for_each = {
    for par in setproduct(keys(var.route_table_ids), var.destinos) :
    "${par[0]}|${par[1]}" => { tabela = var.route_table_ids[par[0]], cidr = par[1] }
  }

  route_table_id         = each.value.tabela
  destination_cidr_block = each.value.cidr
  transit_gateway_id     = aws_ec2_transit_gateway.este.id

  depends_on = [aws_ec2_transit_gateway_vpc_attachment.este]
}
