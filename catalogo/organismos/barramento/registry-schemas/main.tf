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

# Quem lê o schema de OUTRA conta. O converter do consumidor (o sink do lake,
# a Lambda que consome Avro) busca a versão pelo id a cada schema novo, e a
# identity policy dele não basta: leitura de schema entre contas exige as duas
# pontas, e a resource policy do Glue é a ponta do cartório. Sem ela o Glue
# responde "Schema is not found" para quem tem a permissão na própria role,
# e a tarefa do conector morre em "Access denied to schema version" (medido em
# 2026-09-05 no sink Iceberg de produção, com 50 eventos parados no tópico).
#
# A política é UMA por conta e região (é a do catálogo inteiro), por isso só
# nasce quando há leitor de fora, e só concede leitura, do registry deste
# plano e dos schemas dele.
resource "aws_glue_resource_policy" "leitores" {
  count = length(var.contas_leitoras) > 0 ? 1 : 0

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "LeituraDeSchemaDeOutraConta"
      Effect    = "Allow"
      Principal = { AWS = [for c in var.contas_leitoras : "arn:aws:iam::${c}:root"] }
      Action = [
        "glue:GetSchemaVersion", "glue:GetSchemaByDefinition", "glue:GetSchema",
        "glue:GetRegistry", "glue:ListSchemas", "glue:ListSchemaVersions",
        "glue:QuerySchemaVersionMetadata",
      ]
      Resource = [
        aws_glue_registry.este.arn,
        "${replace(aws_glue_registry.este.arn, ":registry/", ":schema/")}/*",
      ]
    }]
  })
}
