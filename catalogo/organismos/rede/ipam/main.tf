# Organismo ipam (02·D5): o plano de endereçamento. Três supernets, uma por
# ambiente; todo CIDR de VPC nasce de um pool, nunca da mão de alguém. Os pools
# são compartilhados com as OUs pela ligação boundary-ram, fora daqui.

resource "aws_vpc_ipam" "este" {
  description = "enderecamento por ambiente e dominio"

  operating_regions {
    region_name = var.regiao
  }

  lifecycle { prevent_destroy = true }
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
