# Organismo appconfig-coexistencia (01.1 §11): flag técnica e operacional de
# roteamento entre executores. Regra de negócio fica fora do store.

resource "aws_appconfig_application" "coexistencia" {
  name        = "coexistencia-de-cores"
  description = "roteamento por requisicao entre executores durante a migracao"
}

resource "aws_appconfig_environment" "ambiente" {
  name           = var.plano
  application_id = aws_appconfig_application.coexistencia.id
}

resource "aws_appconfig_configuration_profile" "roteamento" {
  application_id = aws_appconfig_application.coexistencia.id
  name           = "roteamento"
  location_uri   = "hosted"
  type           = "AWS.Freeform"
}
