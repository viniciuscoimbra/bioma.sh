# Organismo registry-schemas (01.1 §1): o cartório. As versões de schema são
# dos produtores (esteira, no deploy); aqui só o registry por plano.

resource "aws_glue_registry" "este" {
  registry_name = "eventos-${var.plano}"

  lifecycle { prevent_destroy = true } # contrato é permanente
}

resource "aws_ssm_parameter" "registry_arn" {
  name  = "/plataforma/barramento/${var.plano}/registry-arn"
  type  = "String"
  tier  = "Advanced"
  value = aws_glue_registry.este.arn
}
