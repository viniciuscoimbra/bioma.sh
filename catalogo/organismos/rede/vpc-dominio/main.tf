# Organismo vpc-dominio (02, 02.2): a rede do domínio num ambiente. Três AZs,
# sem internet, encaixe no hub. O CIDR vem do pool do IPAM. A associação ao
# plano é da ligação associacao-tgw (rede); aqui só nasce o attachment, e o id
# dele é publicado como hormônio para a ligação ler.

# O ARN do parâmetro do hub é MONTADO, e não recebido da célula que o publica.
#
# Recebê-lo por `dependency` obriga a célula a declarar `mock_outputs` para o
# plano de uma árvore que ainda não aplicou, e mock que alimenta `data` não é
# inerte: o provider resolve o data DURANTE o plano e chama a nuvem com o valor
# inventado. O nome é convenção (`/fundacao/rede/tgw-id`), a conta é a da rede
# e a região é a da instituição.
locals {
  tgw_id_parameter_arn = format(
  "arn:aws:ssm:%s:%s:parameter/fundacao/rede/tgw-id", var.regiao, var.conta_rede)
}

data "aws_ssm_parameter" "tgw_id" {
  name = local.tgw_id_parameter_arn
}

data "aws_availability_zones" "azs" {
  state = "available"
}

resource "aws_vpc" "esta" {
  ipv4_ipam_pool_id    = var.ipam_pool_id
  ipv4_netmask_length  = var.netmask
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "${var.dominio}-${var.ambiente}" }
}

resource "aws_subnet" "privada" {
  count = 3

  vpc_id            = aws_vpc.esta.id
  cidr_block        = cidrsubnet(aws_vpc.esta.cidr_block, 2, count.index)
  availability_zone = data.aws_availability_zones.azs.names[count.index]
  tags              = { Name = "${var.dominio}-${var.ambiente}-priv-${count.index}" }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "hub" {
  transit_gateway_id = data.aws_ssm_parameter.tgw_id.value
  vpc_id             = aws_vpc.esta.id
  subnet_ids         = aws_subnet.privada[*].id
  tags = {
    Name  = "${var.dominio}-${var.ambiente}"
    plano = var.ambiente == "prod" ? "producao" : "nao-producao"
  }
}

resource "aws_route_table" "privada" {
  vpc_id = aws_vpc.esta.id
}

resource "aws_route" "para_o_hub" {
  route_table_id         = aws_route_table.privada.id
  destination_cidr_block = "10.0.0.0/8" # a supernet inteira; o plano decide o alcance real
  transit_gateway_id     = data.aws_ssm_parameter.tgw_id.value
}

resource "aws_route_table_association" "privada" {
  count = 3

  subnet_id      = aws_subnet.privada[count.index].id
  route_table_id = aws_route_table.privada.id
}

# gateway endpoints: chamada local a S3/DDB não sai pela rede (02·D7);
# origem roteada usa os interface endpoints centrais, nunca estes.
resource "aws_vpc_endpoint" "gateway" {
  for_each = toset(["s3", "dynamodb"])

  vpc_id            = aws_vpc.esta.id
  service_name      = "com.amazonaws.${var.regiao}.${each.value}"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.privada.id]
}

# execute-api: a porta que as api-privada do domínio recebem por input
resource "aws_vpc_endpoint" "execute_api" {
  vpc_id              = aws_vpc.esta.id
  service_name        = "com.amazonaws.${var.regiao}.execute-api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.privada[*].id
  private_dns_enabled = true
}

# o hormônio do attachment: a ligação associacao-tgw (na rede) lê daqui
resource "aws_ssm_parameter" "attachment_id" {
  name  = "/dominios/${var.dominio}/${var.ambiente}/attachment-id"
  type  = "String"
  tier  = "Advanced"
  value = aws_ec2_transit_gateway_vpc_attachment.hub.id
}
