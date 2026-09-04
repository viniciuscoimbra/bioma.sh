# Organismo ipam (02·D5): o plano de endereçamento. Três supernets, uma por
# ambiente; todo CIDR de VPC nasce de um pool, nunca da mão de alguém. Os pools
# são compartilhados com as OUs pela ligação boundary-ram, fora daqui.

resource "aws_vpc_ipam" "este" {
  description = "enderecamento por ambiente e dominio"

  # A região principal, sempre. Acrescentar região é ADITIVO e não recria o
  # IPAM, e é o que permite a um plano inteiro nascer noutra região sem um
  # segundo IPAM para manter em paralelo.
  operating_regions {
    region_name = var.regiao
  }

  dynamic "operating_regions" {
    for_each = var.supernets_por_regiao
    content {
      region_name = operating_regions.key
    }
  }

  lifecycle { prevent_destroy = true }
}

# Um ESCOPO por região extra, e não pools soltos no escopo padrão. Dois pools
# com CIDR sobreposto no mesmo escopo o IPAM recusa, e enquanto São Paulo e
# Virgínia coexistirem os mesmos CIDRs vão existir dos dois lados: o plano de
# endereçamento é o mesmo, mudou a região. Escopos separados deixam os dois
# viverem juntos, e quando o lado antigo for destruído não sobra duplicata.
resource "aws_vpc_ipam_scope" "por_regiao" {
  for_each = var.supernets_por_regiao

  ipam_id     = aws_vpc_ipam.este.id
  description = "enderecamento em ${each.key}"
}

resource "aws_vpc_ipam_pool" "ambiente" {
  for_each = var.supernets

  description    = "supernet ${each.key}"
  address_family = "ipv4"
  ipam_scope_id  = aws_vpc_ipam.este.private_default_scope_id
  locale         = var.regiao

  lifecycle { prevent_destroy = true }
}

resource "aws_vpc_ipam_pool_cidr" "supernet" {
  for_each = var.supernets

  ipam_pool_id = aws_vpc_ipam_pool.ambiente[each.key].id
  cidr         = each.value
}


# Os pools das regiões extras. A chave carrega região E ambiente
# (`us-east-1/dev`), e por isso NÃO colide com as chaves de `ambiente` acima:
# nenhum pool que já existe muda de endereço no estado, e nada é recriado.
locals {
  pools_extras = merge([
    for regiao, supernets in var.supernets_por_regiao : {
      for ambiente, cidr in supernets : "${regiao}/${ambiente}" => {
        regiao   = regiao
        ambiente = ambiente
        cidr     = cidr
      }
    }
  ]...)
}

resource "aws_vpc_ipam_pool" "ambiente_por_regiao" {
  for_each = local.pools_extras

  description    = "supernet ${each.value.ambiente} (${each.value.regiao})"
  address_family = "ipv4"
  ipam_scope_id  = aws_vpc_ipam_scope.por_regiao[each.value.regiao].id
  locale         = each.value.regiao

  lifecycle { prevent_destroy = true }
}

resource "aws_vpc_ipam_pool_cidr" "supernet_por_regiao" {
  for_each = local.pools_extras

  ipam_pool_id = aws_vpc_ipam_pool.ambiente_por_regiao[each.key].id
  cidr         = each.value.cidr
}
