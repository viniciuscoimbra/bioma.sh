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
