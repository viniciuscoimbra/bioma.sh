# Ligação resolucao-central: a VPC de um domínio passa a resolver os endpoints
# compartilhados pelo nome público do serviço.
#
# É ligação, e não parte da receita da VPC, porque o ato tem dois donos: quem
# hospeda os endpoints autoriza, e quem tem a VPC associa. Escrito dentro da
# VPC, o par vira ciclo, e o terragrunt recusa: os endpoints precisam saber
# quais VPCs autorizar, e a VPC precisaria saber quais zonas associar.
#
# Sem esta ligação o endpoint existe, o nome do serviço resolve para o IP
# público na conta do domínio, e a rota não leva a lugar nenhum. O sintoma
# aparece na carga, com a rede parecendo perfeita: o nó de um cluster não baixa
# a imagem do kubelet e não entra no cluster.

resource "aws_route53_zone_association" "esta" {
  for_each = toset(var.zonas)

  zone_id = each.value
  vpc_id  = var.vpc_id
}
