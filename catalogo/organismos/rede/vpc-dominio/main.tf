# Organismo vpc-dominio (02, 02.2): a rede do domínio num ambiente. Três AZs,
# sem internet, encaixe no hub. O CIDR vem do pool do IPAM. A associação ao
# plano é da ligação associacao-tgw (rede); aqui só nasce o attachment, e o id
# dele é publicado como hormônio para a ligação ler.

locals {
  # O plano de rota sai daqui uma vez só. A tag do attachment e a trava do
  # grupo de segurança precisam concordar, e duas derivações independentes foi
  # como elas divergiram antes: a tag comparava `ambiente == "prod"`, palavra
  # que nenhuma célula usa (o vocabulário do IPAM e das contas é dev/hml/prd),
  # e toda VPC de produção saía marcada como não-produção.
  plano = var.ambiente == "prd" ? "producao" : "nao-producao"

  # A supernet diz o plano pelo segundo octeto: produção ocupa 10.0.0.0/10,
  # e homologação, desenvolvimento e a não-produção da plataforma ocupam de
  # 10.64.0.0 para cima (02.2 §3). Fora de 10.0.0.0/8 o hub não governa a
  # faixa, então ela não entra nesta conta.
  cidrs_de_outro_plano = [
    for c in var.cidrs_permitidos : c
    if split(".", c)[0] == "10" && (tonumber(split(".", c)[1]) < 64 ? "producao" : "nao-producao") != local.plano
  ]
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

# As camadas da VPC. Cada uma é um conjunto de sub-redes, uma por zona, com
# tamanho e posição declarados pela instituição: a carga de um domínio não cabe
# num tamanho só, e o desenho de quem opera o domínio é quem sabe o layout.
#
# Três sub-redes /18 genéricas era o que existia aqui, e um domínio real pediu
# camadas por natureza de carga (fila, banco, contêiner, uso geral). Camada com
# `rota_default = false` não recebe a rota da supernet: banco que não fala com
# ninguém fora é assim que se declara.
#
# `prefixo_bits` é quanto se acrescenta ao prefixo da VPC (uma /16 com bits 10
# vira /26), e `indices` diz quais blocos daquele tamanho esta camada ocupa, um
# por zona. Índice se escolhe uma vez e não se mexe: renumerar destrói a
# sub-rede e leva junto o que estiver dentro.
locals {
  zonas = slice(data.aws_availability_zones.azs.names, 0, 3)

  # camada × zona, achatado para o for_each dos recursos
  sub_redes = merge([
    for nome, c in var.camadas : {
      for i, indice in c.indices : "${nome}-${i}" => {
        camada    = nome
        zona      = local.zonas[i]
        cidr      = cidrsubnet(aws_vpc.esta.cidr_block, c.prefixo_bits, indice)
        etiquetas = c.etiquetas
      }
    }
  ]...)
}

resource "aws_subnet" "camada" {
  for_each = local.sub_redes

  vpc_id            = aws_vpc.esta.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.zona
  tags = merge(
    { Name = "${var.dominio}-${var.ambiente}-${each.key}" },
    each.value.etiquetas,
  )
}

# O attachment mora em sub-rede própria, e não numa camada de carga: trocar a
# camada de uma carga não pode arrastar o attachment do hub junto.
resource "aws_subnet" "tgw" {
  count = 3

  vpc_id            = aws_vpc.esta.id
  cidr_block        = cidrsubnet(aws_vpc.esta.cidr_block, var.bits_tgw, var.indices_tgw[count.index])
  availability_zone = local.zonas[count.index]
  tags              = { Name = "${var.dominio}-${var.ambiente}-tgw-${count.index}" }
}

resource "aws_ec2_transit_gateway_vpc_attachment" "hub" {
  transit_gateway_id = var.tgw_id
  vpc_id             = aws_vpc.esta.id
  subnet_ids         = aws_subnet.tgw[*].id
  tags = {
    Name  = "${var.dominio}-${var.ambiente}"
    plano = local.plano
  }
}

# O grupo de segurança das cargas desta VPC. Sem ele, cada peça que mora aqui
# (broker do MSK, banco do ledger, endpoint privado) pedia o id de um SG que
# não nascia em lugar nenhum, e a célula saía com `security_group_ids = []`.
# Quem hospeda a rede é quem hospeda a fronteira dela: a peça não escolhe a
# própria porta.
#
# A regra anterior admitia só o CIDR desta VPC e nascia com `cidrs_permitidos`
# vazio. Estava errada por duas razões. A primeira é de rede: o Transit Gateway
# roteia sem traduzir endereço, então o pacote vindo de outra VPC chega com o IP
# de origem DELA, nunca com o desta. O conector do MSK Connect, que roda na VPC
# de dados e fala com os brokers na VPC de barramento, batia num SG que só
# conhecia o barramento. Vale para todo consumidor roteado que venha a existir
# no banco do ledger ou no Redshift, hoje sem par declarado. A segunda razão é
# de premissa: o comentário mandava declarar aqui o tráfego de OUTRO PLANO, e
# plano não cruza plano (02·D5). O hub mata isso no blackhole; a regra de SG
# que descrevesse esse caminho seria uma promessa que a rota nega.
#
# O par entra um a um, e por referência. A célula liga `cidrs_permitidos` ao
# `cidr_block` publicado pela VPC do par, em vez de digitar faixa à mão. O
# organismo recusa CIDR malformado, prefixo mais curto que /16 (o tamanho que o
# IPAM aloca por VPC) e CIDR do outro plano. A prova de plano só se aplica
# dentro de 10.0.0.0/8: cliente de Client VPN em 100.64/10 e rede de fornecedor
# por Site-to-Site não moram em plano nenhum, quem as governa é a tabela de
# integração externa. O piso de /16, esse, vale para toda entrada, senão
# 0.0.0.0/0 entraria por essa mesma porta.
resource "aws_security_group" "cargas" {
  name        = "${var.dominio}-${var.ambiente}-cargas"
  description = "Cargas da VPC ${var.dominio}-${var.ambiente}"
  vpc_id      = aws_vpc.esta.id

  tags = { Name = "${var.dominio}-${var.ambiente}-cargas" }
}

resource "aws_vpc_security_group_ingress_rule" "de_dentro" {
  security_group_id = aws_security_group.cargas.id
  cidr_ipv4         = aws_vpc.esta.cidr_block
  ip_protocol       = "-1"
  description       = "a propria VPC"
}

resource "aws_vpc_security_group_ingress_rule" "declarada" {
  count = length(var.cidrs_permitidos)

  security_group_id = aws_security_group.cargas.id
  cidr_ipv4         = var.cidrs_permitidos[count.index]
  ip_protocol       = "-1"
  description       = "par declarado na celula"

  # A trava de plano mora no recurso, não na variável, porque só aqui ela
  # enxerga o `local.plano` que a tag do attachment também usa. Uma derivação
  # para os dois, e a regra de SG nunca contradiz a associação no hub.
  lifecycle {
    precondition {
      condition     = length(local.cidrs_de_outro_plano) == 0
      error_message = "cidrs_permitidos declara CIDR de outro plano (${join(", ", local.cidrs_de_outro_plano)}). Esta VPC está no plano ${local.plano}, e produção não fala com não-produção (02·D5). Produção é 10.0.0.0/10; homologação, desenvolvimento e a não-produção da plataforma ficam de 10.64.0.0 para cima (02.2 §3)."
    }
  }
}

# Saída aberta: o caminho para fora já é decidido pela rota e pela inspeção de
# egress (02·D1), e fechar aqui de novo só esconde onde a decisão mora.
resource "aws_vpc_security_group_egress_rule" "saida" {
  security_group_id = aws_security_group.cargas.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "saida pela rota e pela inspecao de egress"
}

# Uma tabela por camada, mais a do attachment. Tabela única servia às três
# sub-redes iguais; com camadas, a rota é decisão de cada uma (a de banco não
# tem rota para lugar nenhum).
resource "aws_route_table" "camada" {
  for_each = var.camadas

  vpc_id = aws_vpc.esta.id
  tags   = { Name = "${var.dominio}-${var.ambiente}-${each.key}" }
}

resource "aws_route_table" "tgw" {
  vpc_id = aws_vpc.esta.id
  tags   = { Name = "${var.dominio}-${var.ambiente}-tgw" }
}

resource "aws_route" "para_o_hub" {
  for_each = { for nome, c in var.camadas : nome => c if c.rota_default }

  route_table_id         = aws_route_table.camada[each.key].id
  destination_cidr_block = var.supernet # o plano de rota decide o alcance real dentro dela
  transit_gateway_id     = var.tgw_id

  # A rota só existe com o attachment de pé: sem isto as duas correm em
  # paralelo e a rota morre com o TGW "inexistente" enquanto o attachment
  # ainda sobe. Na conta dona do TGW a corrida nunca perdia, e foi por isso
  # que o defeito só apareceu na primeira VPC de outra conta.
  depends_on = [aws_ec2_transit_gateway_vpc_attachment.hub]
}

# Destino fora da supernet que também sai pelo hub. Existe porque nem toda
# origem legítima mora em 10/8: o cliente de VPN de acesso chega em 100.64/10,
# e sem a rota de volta o pacote de ida chega e a resposta morre na tabela. A
# ida funcionando e a volta não é o defeito mais caro de achar, porque tudo
# parece certo dos dois lados.
#
# É lista declarada, e não faixa fixa: quem decide que existe outra origem é a
# instituição, e chumbar 100.64 aqui presumiria que toda instalação tem VPN.
resource "aws_route" "destino_extra" {
  for_each = {
    for par in setproduct(
      [for nome, c in var.camadas : nome if c.rota_default],
      var.destinos_extras_pelo_hub
    ) : "${par[0]}|${par[1]}" => { camada = par[0], cidr = par[1] }
  }

  route_table_id         = aws_route_table.camada[each.value.camada].id
  destination_cidr_block = each.value.cidr
  transit_gateway_id     = var.tgw_id

  depends_on = [aws_ec2_transit_gateway_vpc_attachment.hub]
}


resource "aws_route_table_association" "camada" {
  for_each = local.sub_redes

  subnet_id      = aws_subnet.camada[each.key].id
  route_table_id = aws_route_table.camada[each.value.camada].id
}

resource "aws_route_table_association" "tgw" {
  count = 3

  subnet_id      = aws_subnet.tgw[count.index].id
  route_table_id = aws_route_table.tgw.id
}

# gateway endpoints: chamada local a S3/DDB não sai pela rede (02·D7);
# origem roteada usa os interface endpoints centrais, nunca estes.
resource "aws_vpc_endpoint" "gateway" {
  for_each = toset(["s3", "dynamodb"])

  vpc_id            = aws_vpc.esta.id
  service_name      = "com.amazonaws.${var.regiao}.${each.value}"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = concat([for r in aws_route_table.camada : r.id], [aws_route_table.tgw.id])
}

# execute-api: a porta que as api-privada do domínio recebem por input
resource "aws_vpc_endpoint" "execute_api" {
  vpc_id              = aws_vpc.esta.id
  service_name        = "com.amazonaws.${var.regiao}.execute-api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [for k, s in aws_subnet.camada : s.id if local.sub_redes[k].camada == var.camada_dos_endpoints]
  private_dns_enabled = true
}

# o hormônio do attachment: a ligação associacao-tgw (na rede) lê daqui
resource "aws_ssm_parameter" "attachment_id" {
  name  = "/dominios/${var.dominio}/${var.ambiente}/attachment-id"
  type  = "String"
  tier  = "Advanced"
  value = aws_ec2_transit_gateway_vpc_attachment.hub.id
}

# A associação é o lado do domínio na promessa do DNS: a regra compartilhada
# por RAM só vale para a VPC que a associou. Vazio pula, porque nem toda
# instalação tem resolução central.
resource "aws_route53_resolver_rule_association" "interna" {
  for_each = toset(var.regras_dns_ids)

  resolver_rule_id = each.value
  vpc_id           = aws_vpc.esta.id
}

