# Organismo conexao-corporativa (02): a rede de quem trabalha na instituição
# encontra o hub.
#
# A arquitetura de referência classificou esta conectividade inteira como
# fronteira, e classificou demais: o circuito e o equipamento do outro lado são
# de terceiro, e o lado da AWS é desta árvore. Sem peça para ele, a única forma
# de ligar o escritório era pelo console, e o desenho não saberia que existe.
#
# Dois túneis por conexão, que é o que a AWS entrega e não é escolha: um cai
# em manutenção e o outro segura. Quem termina os dois do lado de lá é o
# equipamento da instituição, e é por isso que o roteamento é declarado e não
# adivinhado.

resource "aws_customer_gateway" "borda" {
  for_each = var.bordas

  type       = "ipsec.1"
  ip_address = each.value.ip_publico
  bgp_asn    = each.value.asn
  tags       = { Name = each.key }
}

resource "aws_vpn_connection" "esta" {
  for_each = var.bordas

  customer_gateway_id = aws_customer_gateway.borda[each.key].id
  transit_gateway_id  = var.tgw_id
  type                = "ipsec.1"

  # BGP quando o outro lado fala BGP, rota escrita quando não fala. Com rota
  # estática a queda de um túnel não é percebida pelo roteamento, e a
  # convergência vira intervenção humana: o preço fica declarado aqui e não
  # descoberto no primeiro incidente.
  static_routes_only = each.value.asn == null

  tags = { Name = each.key }
}

# As faixas do lado de lá, quando não há BGP para anunciá-las.
resource "aws_ec2_transit_gateway_route" "estatica" {
  for_each = {
    for par in flatten([
      for nome, b in var.bordas : [
        for cidr in b.faixas : { chave = "${nome}|${cidr}", nome = nome, cidr = cidr }
      ] if b.asn == null
    ]) : par.chave => par
  }

  destination_cidr_block         = each.value.cidr
  transit_gateway_attachment_id  = aws_vpn_connection.esta[each.value.nome].transit_gateway_attachment_id
  transit_gateway_route_table_id = var.route_table_id
}

# O attachment do túnel precisa da mesma associação que o de VPC: aceito e não
# associado não roteia nada, e foi assim que uma migração desta árvore cortou
# o acesso de todas as contas por cinquenta minutos.
resource "aws_ec2_transit_gateway_route_table_association" "esta" {
  for_each = var.bordas

  transit_gateway_attachment_id  = aws_vpn_connection.esta[each.key].transit_gateway_attachment_id
  transit_gateway_route_table_id = var.route_table_id
}

resource "aws_ec2_transit_gateway_route_table_propagation" "propaga" {
  for_each = {
    for par in flatten([
      for nome, b in var.bordas : [
        for rt in var.propagar_para : { chave = "${nome}|${rt}", nome = nome, rt = rt }
      ]
    ]) : par.chave => par
  }

  transit_gateway_attachment_id  = aws_vpn_connection.esta[each.value.nome].transit_gateway_attachment_id
  transit_gateway_route_table_id = each.value.rt
}
