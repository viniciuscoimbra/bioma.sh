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
# identity policy dele não basta: o Schema Registry NÃO aceita resource policy
# (a documentação diz isso com todas as letras, e uma resource policy do Glue
# aplicada em 2026-09-05 não mudou nada: o Glue seguiu respondendo "Schema is
# not found" à conta de dados, e a tarefa do sink morrendo em "Access denied
# to schema version"). O caminho oficial entre contas é ASSUMIR UM PAPEL nesta
# conta: o `AWSKafkaAvroConverter` tem `assumeRoleArn`, e os serializers das
# linguagens chamam o STS antes de falar com o registry.
#
# Este é o papel. Confia nas contas leitoras (quem assume é decidido lá, na
# IAM de cada uma) e só lê: o registry deste plano e os schemas dele. Não
# nasce sem leitor de fora.
resource "aws_iam_role" "leitor" {
  count = length(var.contas_leitoras) > 0 ? 1 : 0
  name  = "registry-leitor-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AsContasLeitorasAssumem"
      Effect    = "Allow"
      Principal = { AWS = [for c in var.contas_leitoras : "arn:aws:iam::${c}:root"] }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "leitor" {
  count = length(var.contas_leitoras) > 0 ? 1 : 0
  name  = "le-o-registry-${var.plano}"
  role  = aws_iam_role.leitor[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "LeituraDoRegistryDoPlano"
      Effect = "Allow"
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

# Quem ESCREVE versão de schema de outra conta: o produtor que serializa Avro
# com o Schema Registry e registra a versão ao publicar (o CDC do livro, com o
# `AWSKafkaAvroConverter` e auto-registro). O contrato deste organismo diz que
# a versão é da esteira; quando o produtor registra, é a regra de
# compatibilidade do schema (BACKWARD_ALL) que faz a revisão, e é por isso que
# este papel só alcança o registry do plano. Mesma razão do leitor: o Schema
# Registry não aceita resource policy, então a conta de fora assume.
resource "aws_iam_role" "escritor" {
  count = length(var.contas_escritoras) > 0 ? 1 : 0
  name  = "registry-escritor-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AsContasEscritorasAssumem"
      Effect    = "Allow"
      Principal = { AWS = [for c in var.contas_escritoras : "arn:aws:iam::${c}:root"] }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "escritor" {
  count = length(var.contas_escritoras) > 0 ? 1 : 0
  name  = "escreve-no-registry-${var.plano}"
  role  = aws_iam_role.escritor[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "EscritaNoRegistryDoPlano"
      Effect = "Allow"
      Action = [
        "glue:GetSchemaVersion", "glue:GetSchemaByDefinition", "glue:GetSchema",
        "glue:GetRegistry", "glue:ListSchemas", "glue:ListSchemaVersions",
        "glue:QuerySchemaVersionMetadata", "glue:PutSchemaVersionMetadata",
        "glue:RegisterSchemaVersion", "glue:CreateSchema", "glue:CheckSchemaVersionValidity",
      ]
      Resource = [
        aws_glue_registry.este.arn,
        "${replace(aws_glue_registry.este.arn, ":registry/", ":schema/")}/*",
      ]
    }]
  })
}
