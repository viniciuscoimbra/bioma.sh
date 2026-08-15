# Organismo resolver-dns (02·D5): resolução privada por ambiente. O inbound é
# um endpoint com dois IPs (02.3); as zonas privadas dos domínios são criadas
# aqui e associadas cross-account por RAM/autorização, fora deste módulo.

resource "aws_security_group" "resolver" {
  name   = "resolver-${var.plano}"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [var.cidr_permitido]
  }

  ingress {
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = [var.cidr_permitido]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_route53_resolver_endpoint" "inbound" {
  name               = "inbound-${var.plano}"
  direction          = "INBOUND"
  security_group_ids = [aws_security_group.resolver.id]

  dynamic "ip_address" {
    for_each = slice(var.subnet_ids, 0, 2)
    content {
      subnet_id = ip_address.value
    }
  }
}

resource "aws_route53_zone" "privada" {
  for_each = toset(var.zonas)

  name = each.value

  vpc {
    vpc_id = var.vpc_id
  }

  lifecycle { prevent_destroy = true }
}

# A regra de encaminhamento é o que faz `interno.` resolver FORA desta conta.
# A zona privada é associada a esta VPC; as outras contas não a enxergam, e a
# promessa do desenho (bloco 02: o RAM compartilha hub, pools E regras de DNS)
# ficava pela metade: endpoint de pé, e nenhuma regra para compartilhar. A
# primeira carga de um domínio falharia na primeira consulta de nome interno.
#
# O caminho da consulta: a VPC do domínio associa a regra compartilhada; a
# consulta casa com o domínio da regra e sai pelo endpoint OUTBOUND desta conta
# (regra compartilhada usa o outbound do dono) em direção aos IPs do INBOUND,
# que respondem pela zona privada.
resource "aws_route53_resolver_endpoint" "outbound" {
  name               = "outbound-${var.plano}"
  direction          = "OUTBOUND"
  security_group_ids = [aws_security_group.resolver.id]

  dynamic "ip_address" {
    for_each = slice(var.subnet_ids, 0, 2)
    content {
      subnet_id = ip_address.value
    }
  }
}

resource "aws_route53_resolver_rule" "interna" {
  for_each = toset(var.zonas)

  name                 = "encaminha-${replace(each.value, ".", "-")}"
  domain_name          = each.value
  rule_type            = "FORWARD"
  resolver_endpoint_id = aws_route53_resolver_endpoint.outbound.id

  dynamic "target_ip" {
    for_each = aws_route53_resolver_endpoint.inbound.ip_address[*].ip
    content {
      ip = target_ip.value
    }
  }
}
