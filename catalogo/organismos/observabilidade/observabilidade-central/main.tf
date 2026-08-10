# Organismo observabilidade-central (14): o sink OAM na conta de observação.
# As contas fonte ligam pela ligação oam-link (nunca daqui). Runbooks de
# resposta como documentos SSM Automation, versionados na receita.

resource "aws_oam_sink" "central" {
  name = "observacao-${var.plano}"
}

resource "aws_oam_sink_policy" "quem_liga" {
  sink_identifier = aws_oam_sink.central.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { AWS = var.contas_fonte }
      Action    = ["oam:CreateLink", "oam:UpdateLink"]
      Resource  = "*"
      Condition = {
        "ForAllValues:StringEquals" = {
          "oam:ResourceTypes" = [
            "AWS::CloudWatch::Metric",
            "AWS::Logs::LogGroup",
            "AWS::XRay::Trace",
            "AWS::ApplicationInsights::Application"
          ]
        }
      }
    }]
  })
}

resource "aws_ssm_document" "runbook" {
  for_each = var.runbooks

  name            = "runbook-${each.key}"
  document_type   = "Automation"
  document_format = "YAML"
  content         = each.value
}
