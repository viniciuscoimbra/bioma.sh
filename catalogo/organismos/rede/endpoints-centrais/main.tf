# Organismo endpoints-centrais (02·D7): interface endpoints compartilhados na
# VPC de rede, para origem que chega roteada (gateway endpoint não é
# transitivo; referencias-rede §2). private_dns desligado: a resolução central
# é feita por PHZ apontando pro endpoint, associada às VPCs consumidoras.
#
# ACRESCENTAR UM SERVIÇO A `var.servicos` É METADE DO ATO. Este organismo cria
# o endpoint, a zona privada e a AUTORIZAÇÃO para cada VPC consumidora; a
# associação em si é do outro lado (ligacoes/resolucao-central, aplicada na
# conta de quem consome), e ela não acontece sozinha. Enquanto ela não roda, o
# nome do serviço resolve para o endereço público na conta do domínio, e a
# chamada morre por timeout de REDE — não por permissão, o que faz procurar no
# lugar errado. Medido assim em 2026-08-26: uma função de varredura em VPC sem
# saída errou 6 vezes por hora durante um dia inteiro, e o endpoint já existia
# havia horas.

resource "aws_security_group" "endpoints" {
  name   = "endpoints-centrais-${var.plano}"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = concat([var.cidr_permitido], var.cidrs_permitidos)
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

# A zona privada que faz a resolução central acontecer. O cabeçalho deste
# organismo sempre a descreveu, e ela não existia: `private_dns` desligado sem
# PHZ é endpoint que ninguém alcança pelo nome, e a conta de domínio resolve o
# nome público do serviço, que a rota não leva a lugar nenhum. O sintoma é
# tardio e caro: o nó de um cluster não baixa a imagem do kubelet e não entra
# no cluster, sem nada na rede dizer por quê.
#
# O nome da zona é o nome público do serviço, e é isso que faz a resolução
# funcionar sem tocar em nada dentro da carga: quem chama `api.ecr.<região>.
# amazonaws.com` recebe o IP privado do endpoint. Alguns serviços moram num
# subdomínio (`api.ecr`, `dkr.ecr`), e a zona é o domínio inteiro.
locals {
  zonas_de_servico = {
    for s in var.servicos :
    s => "${replace(s, ".", "-") == s ? s : join(".", reverse(split(".", s)))}.${var.regiao}.amazonaws.com"
  }
}

resource "aws_route53_zone" "servico" {
  for_each = local.zonas_de_servico

  name    = each.value
  comment = "resolucao central do endpoint de ${each.key}"

  vpc {
    vpc_id = var.vpc_id
  }

  # A associação das VPCs consumidoras é feita FORA daqui, por ligação: ela
  # mora em duas contas, e o Terraform recria a associação que não conhece a
  # cada apply se ela for gerida junto com a zona.
  lifecycle {
    ignore_changes = [vpc]
  }
}

resource "aws_route53_record" "servico" {
  for_each = local.zonas_de_servico

  zone_id = aws_route53_zone.servico[each.key].zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = aws_vpc_endpoint.servico[each.key].dns_entry[0].dns_name
    zone_id                = aws_vpc_endpoint.servico[each.key].dns_entry[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# O curinga cobre o que o serviço publica em subdomínio (o registro de imagem
# de cada conta, por exemplo): sem ele, `<conta>.dkr.ecr.<região>.amazonaws.com`
# não resolve, e é justamente esse nome que o nó procura.
resource "aws_route53_record" "servico_curinga" {
  for_each = local.zonas_de_servico

  zone_id = aws_route53_zone.servico[each.key].zone_id
  name    = "*.${each.value}"
  type    = "A"

  alias {
    name                   = aws_vpc_endpoint.servico[each.key].dns_entry[0].dns_name
    zone_id                = aws_vpc_endpoint.servico[each.key].dns_entry[0].hosted_zone_id
    evaluate_target_health = false
  }
}

# A autorização é o lado central do hormônio: sem ela, a conta do domínio não
# consegue associar a própria VPC a esta zona.
resource "aws_route53_vpc_association_authorization" "consumidora" {
  for_each = {
    for par in setproduct(keys(local.zonas_de_servico), var.vpcs_consumidoras) :
    "${par[0]}|${par[1]}" => { zona = par[0], vpc = par[1] }
  }

  zone_id = aws_route53_zone.servico[each.value.zona].zone_id
  vpc_id  = each.value.vpc
}
