# Organismo celula-telemetria (14): a ponta na conta observada. Publica o
# contrato de sinal (endpoint do collector ADOT, atributos obrigatórios) e
# liga o DevOps Guru nos recursos etiquetados. O link OAM é ligação, fora
# daqui. O collector em si roda como sidecar/daemon da aplicação (esteira).

resource "aws_ssm_parameter" "contrato_de_sinal" {
  name = "/observabilidade/${var.dominio}/${var.ambiente}/contrato-de-sinal"
  type = "String"

  value = jsonencode({
    otlp_endpoint          = var.otlp_endpoint
    atributos_obrigatorios = ["dominio", "ambiente", "servico", "versao"]
  })
}

resource "aws_devopsguru_resource_collection" "estes" {
  type = "AWS_TAGS"

  tags {
    app_boundary_key = "devops-guru-${var.dominio}"
    tag_values       = [var.ambiente]
  }
}
