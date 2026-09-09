# Organismo ca-privada (02·D6, Lacuna 1 de add-ambiente-efemero): a raiz de
# confiança para TLS em nome interno. Domínio `.internal`/`.interno` não é
# público, então nenhum certificado do ACM público pode cobri-lo — é preciso
# uma CA privada que a Organization confie, e essa CA nasce UMA vez.
#
# Mora na conta de rede (`network`), mesmo padrão que a VPN já usa hoje
# (`vpn-acesso`: CA própria emitida em 2026-08-14, certificado no ACM da conta
# de rede). É onde a infraestrutura de TLS/DNS compartilhada entre domínios já
# vive — nenhum domínio precisa da própria CA.
#
# NÃO emite certificado aqui: quem usa (organismos/rede/certificado-wildcard,
# em cada conta consumidora) pede o próprio certificado a esta CA, via RAM.
# Uma CA, N certificados — nunca N CAs.

resource "aws_acmpca_certificate_authority" "raiz" {
  type = "ROOT"

  certificate_authority_configuration {
    key_algorithm     = "RSA_2048"
    signing_algorithm = "SHA256WITHRSA"

    subject {
      common_name = var.dominio_raiz
    }
  }

  # GENERAL_PURPOSE (o padrão do recurso), não SHORT_LIVED_CERTIFICATE: o modo
  # de vida curta trava a CA a emitir só certificado com validade de até 7
  # dias, e o certificado wildcard do efêmero é permanente — emitido uma vez,
  # usado por meses. A raiz em si não gira: revogar e reemitir invalidaria
  # todo certificado wildcard já emitido em toda conta consumidora, ao mesmo
  # tempo, então a trava é `prevent_destroy` no Terraform.

  tags = { papel = "ca-raiz-interna" }

  lifecycle { prevent_destroy = true }
}

# A CA nasce sem certificado de si própria — é preciso emitir e importar o
# certificado autoassinado antes que ela possa emitir qualquer outro. Sem este
# passo, `aws_acmpca_certificate_authority` fica em PENDING_CERTIFICATE para
# sempre, e a primeira chamada de `IssueCertificate` (de qualquer conta) falha
# com "certificate authority is not valid".
resource "aws_acmpca_certificate" "raiz" {
  certificate_authority_arn   = aws_acmpca_certificate_authority.raiz.arn
  certificate_signing_request = aws_acmpca_certificate_authority.raiz.certificate_signing_request
  signing_algorithm           = "SHA256WITHRSA"

  template_arn = "arn:aws:acm-pca:::template/RootCACertificate/V1"

  validity {
    type  = "YEARS"
    value = 10
  }
}

resource "aws_acmpca_certificate_authority_certificate" "raiz" {
  certificate_authority_arn = aws_acmpca_certificate_authority.raiz.arn

  certificate       = aws_acmpca_certificate.raiz.certificate
  certificate_chain = aws_acmpca_certificate.raiz.certificate_chain
}

# O compartilhamento por RAM. Diferente do Transit Gateway e dos pools do
# IPAM (ligacoes/boundary-ram, que compartilha vários recursos numa share só),
# a Private CA fica em share PRÓPRIA: ela é sensível o bastante (raiz de
# confiança TLS de toda a Organization) para não se misturar com o hormônio de
# rede num único blast radius de compartilhamento.
resource "aws_ram_resource_share" "esta" {
  name                      = "ca-privada-interna"
  allow_external_principals = false

  depends_on = [aws_acmpca_certificate_authority_certificate.raiz]
}

resource "aws_ram_resource_association" "esta" {
  resource_arn       = aws_acmpca_certificate_authority.raiz.arn
  resource_share_arn = aws_ram_resource_share.esta.arn
}

# A OU inteira, não conta a conta — mesma escolha de ligacoes/boundary-ram:
# lista de conta envelhece a cada conta nova, e a que faltar não emite
# certificado, sem erro nenhum até alguém precisar.
resource "aws_ram_principal_association" "esta" {
  for_each = toset(var.principals)

  principal          = each.value
  resource_share_arn = aws_ram_resource_share.esta.arn
}
