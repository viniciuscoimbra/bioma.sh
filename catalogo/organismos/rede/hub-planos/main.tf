# Organismo hub-planos (02·D1, 02·D5): o hub e os três planos de rota.
# Associação e propagação NÃO vivem aqui: são a ligação associacao-tgw, do
# mesmo dono, em state próprio, revisada attachment a attachment. O hub publica
# o próprio id como hormônio (advanced tier; quem lê de fora usa o ARN).

resource "aws_ec2_transit_gateway" "hub" {
  description                     = "hub regional"
  default_route_table_association = "disable" # associação é decisão, nunca default
  # Aceitar o attachment não é decisão: quem pode anexar já foi decidido pelo
  # share do RAM (as duas OUs), e um attachment aceito SEM associação não roteia
  # nada, porque a associação de tabela continua sendo ato da ligação. Com o
  # aceite manual, a primeira VPC de outra conta ficou pendingAcceptance e a
  # rota dela morreu com o TGW "inexistente".
  auto_accept_shared_attachments  = "enable"
  default_route_table_propagation = "disable"

  lifecycle { prevent_destroy = true }
}

resource "aws_ec2_transit_gateway_route_table" "plano" {
  for_each = toset(["producao", "nao-producao", "compartilhado"])

  transit_gateway_id = aws_ec2_transit_gateway.hub.id
  tags               = { Name = "rt-${each.value}" }
}

# blackhole: o cruzamento de planos morre no lookup (02.3); a propagação
# desabilitada é parte do controle, o blackhole é a trava explícita.
resource "aws_ec2_transit_gateway_route" "blackhole" {
  for_each = var.blackholes

  destination_cidr_block         = each.value.cidr
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.plano[each.value.plano].id
  blackhole                      = true
}

resource "aws_ssm_parameter" "tgw_id" {
  name  = "/fundacao/rede/tgw-id"
  type  = "String"
  tier  = "Advanced" # exigido para compartilhar entre contas (via boundary-ram)
  value = aws_ec2_transit_gateway.hub.id
}
