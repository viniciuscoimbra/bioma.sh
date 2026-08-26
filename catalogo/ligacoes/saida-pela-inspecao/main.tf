# Ligação saida-pela-inspecao (02·D1): a rota que faz a saída do plano cair no
# firewall. Sem ela, o pacote que a VPC manda ao hub com destino à internet
# chega no hub e morre por falta de rota, com o sintoma de timeout puro (nada
# volta, nem rejeição): foi assim que a subida do Flux parou em
# ImagePullBackOff com "dial tcp ...:443: i/o timeout".
#
# É ligação, e não parte do hub: quem cria o hub não conhece a VPC de inspeção
# (ela nasce depois, no organismo inspecao-egress, e o attachment dela é que é
# o alvo). Escrito dentro do hub, o par vira ciclo. Escrito dentro da inspeção,
# a decisão de QUAL plano sai pela internet mudaria de dono: ela é da rede, no
# plano, e por isso mora aqui, uma célula por plano que tem direito de sair.
#
# A rota é estática de propósito. Rota default não se propaga por BGP nem por
# attachment: só existe se alguém a declarar, e declarar é a decisão.
resource "aws_ec2_transit_gateway_route" "default" {
  for_each = toset(var.route_table_ids)

  destination_cidr_block         = var.destino
  transit_gateway_route_table_id = each.value
  transit_gateway_attachment_id  = var.attachment_da_inspecao
}
