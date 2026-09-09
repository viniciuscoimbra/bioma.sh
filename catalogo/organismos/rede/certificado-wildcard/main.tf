# Organismo certificado-wildcard (02·D6, Lacuna 1 de add-ambiente-efemero): o
# certificado ACM que ambiente-efemero referencia (var.certificado_wildcard_arn).
#
# Nasce NA CONTA CONSUMIDORA (cada <dominio>-dev, <dominio>-hml), nunca na
# conta de rede: o certificado tem que estar na mesma conta e região da API
# Gateway que o usa — é exigência do próprio recurso
# aws_api_gateway_domain_name, não escolha deste organismo. A CA que assina,
# essa sim é uma só, compartilhada por RAM (organismos/rede/ca-privada).
#
# Um wildcard cobre TODOS os prefixos de PR/candidato de um domínio+ambiente:
# `*.<zona>` (ex.: `*.dev.interno`), então nasce uma vez por conta, não um
# certificado por PR — é o que a Decisão 2 do design.md já fixava.

resource "aws_acm_certificate" "wildcard" {
  domain_name               = "*.${var.zona_dns_nome}"
  certificate_authority_arn = var.ca_privada_arn

  # A validação de um certificado de Private CA não é DNS nem e-mail (isso é
  # só para o ACM público): a CA assina direto quando o pedido chega, sem
  # prova de propriedade de domínio. Não existe `validation_method` para
  # certificado de CA privada.

  tags = { papel = "wildcard-efemero", zona = var.zona_dns_nome }

  lifecycle {
    create_before_destroy = true
    # O wildcard é permanente por natureza (Decisão 2 do design.md): destruí-lo
    # por engano quebraria TODO ambiente efêmero de pé naquele domínio+ambiente
    # ao mesmo tempo, não um PR isolado.
    prevent_destroy = true
  }
}
