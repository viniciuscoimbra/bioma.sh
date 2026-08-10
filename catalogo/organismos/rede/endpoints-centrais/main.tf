# Organismo endpoints-centrais (02·D7): interface endpoints compartilhados na
# VPC de rede, para origem que chega roteada (gateway endpoint não é
# transitivo; referencias-rede §2). private_dns desligado: a resolução central
# é feita por PHZ apontando pro endpoint, associada às VPCs consumidoras.

resource "aws_security_group" "endpoints" {
  name   = "endpoints-centrais-${var.plano}"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.cidr_permitido]
  }
}

resource "aws_vpc_endpoint" "servico" {
  for_each = toset(var.servicos)

  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.regiao}.${each.value}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.subnet_ids
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = false
}
