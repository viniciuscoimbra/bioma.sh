# Organismo inspecao-egress (02·D1): toda saída passa pelo firewall central.
# VPC de inspeção na faixa CGNAT, appliance mode no attachment (assimetria de
# AZ mata sessão stateful, 02.3), NAT para a internet depois da inspeção.

resource "aws_vpc" "inspecao" {
  cidr_block = var.cidr_inspecao
  tags       = { Name = "inspecao-${var.plano}" }
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

data "aws_ssm_parameter" "tgw_id" {
  name = var.tgw_id_parameter_arn
}

resource "aws_ec2_transit_gateway_vpc_attachment" "inspecao" {
  transit_gateway_id     = data.aws_ssm_parameter.tgw_id.value
  vpc_id                 = aws_vpc.inspecao.id
  subnet_ids             = aws_subnet.firewall[*].id
  appliance_mode_support = "enable"
  tags                   = { Name = "inspecao-${var.plano}", plano = var.plano }
}

resource "aws_networkfirewall_firewall_policy" "politica" {
  name = "egress-${var.plano}"

  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]

    dynamic "stateful_rule_group_reference" {
      for_each = var.grupos_de_regra_arns
      content {
        resource_arn = stateful_rule_group_reference.value
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
