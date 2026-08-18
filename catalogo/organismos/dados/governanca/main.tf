# Organismo governanca (04): Lake Formation como plano de permissão do lake
# (grants saem pela ligação acesso-lake, concedidos pelo dono do produto) e os
# jobs Glue de bronze→silver da plataforma. Jobs de gold são do domínio
# (dominio-base/job-produto-gold).
#
# O enforcement do Lake Formation só existe onde a localização S3 está
# registrada (04 · Decisão 2). Bronze e silver são da plataforma, então o
# registro deles mora aqui, com role própria: o gold do domínio se registra em
# dominio-base/porta-dados, na conta do domínio, pelo mesmo desenho.

# Quem está aplicando entra na lista de administradores do lake, junto com os
# declarados. Sem isto o apply é um autogol: ele grava a lista, se remove dela,
# e o recurso seguinte (a LF-Tag) morre com "Insufficient Lake Formation
# permission(s): Required Create LF Tag on Catalog". O erro não menciona que
# quem tirou a permissão foi o próprio apply, três recursos antes.
#
# `aws_caller_identity` não recebe argumento, então não há valor de mock que
# possa alcançá-lo.
data "aws_caller_identity" "quem_aplica" {}

locals {
  administradores = distinct(concat(
    var.administradores_arns,
    var.incluir_quem_aplica ? [replace(data.aws_caller_identity.quem_aplica.arn, "/:sts::(\\d+):assumed-role/([^/]+)/.*/", ":iam::$1:role/$2")] : [],
  ))
}

resource "aws_lakeformation_data_lake_settings" "estas" {
  admins = local.administradores

  # sem IAMAllowedPrincipals: permissão só por grant explícito
  create_database_default_permissions {
    permissions = []
    principal   = "IAM_ALLOWED_PRINCIPALS"
  }
  create_table_default_permissions {
    permissions = []
    principal   = "IAM_ALLOWED_PRINCIPALS"
  }
}

# As LF-Tags são o vocabulário que o contrato de dado compila (04 · Decisão 2):
# a chave e os valores possíveis nascem aqui, a atribuição a tabela e coluna é
# da ligação classificacao-lake, e o grant por tag é da ligação acesso-lake.
resource "aws_lakeformation_lf_tag" "classificacao" {
  for_each = var.lf_tags

  key    = each.key
  values = each.value

  depends_on = [aws_lakeformation_data_lake_settings.estas]
}

# O vocabulário é um só e mora aqui; quem classifica o próprio produto é o
# domínio, na conta dele (04 · Decisão 4). O Lake Formation compartilha a tag
# por grant: DESCRIBE para enxergar, ASSOCIATE para atribuir. Sem isto cada
# conta de domínio inventaria o próprio vocabulário e o grant por tag central
# não casaria com nada.
resource "aws_lakeformation_permissions" "tags_para_quem_classifica" {
  for_each = { for par in setproduct(keys(var.lf_tags), var.contas_que_classificam) : "${par[0]}/${par[1]}" => { tag = par[0], conta = par[1] } }

  principal   = each.value.conta
  permissions = ["DESCRIBE", "ASSOCIATE"]

  lf_tag {
    key    = each.value.tag
    values = var.lf_tags[each.value.tag]
  }

  depends_on = [aws_lakeformation_lf_tag.classificacao]
}

resource "aws_glue_catalog_database" "bronze" {
  name = "bronze_${var.plano}"

  # o sink Iceberg cria as tabelas neste banco; o banco é o mapa do que
  # aterrissou, e destruí-lo apaga o mapa sem tocar um byte de dado
  lifecycle { prevent_destroy = true }
}

resource "aws_glue_catalog_database" "silver" {
  name = "silver_${var.plano}"

  # o catálogo guarda a definição das tabelas que a esteira cria; destruí-lo
  # apaga o mapa do lake sem tocar um byte de dado
  lifecycle { prevent_destroy = true }
}

# A role que o Lake Formation assume para vender credencial sobre o bronze e o
# silver. Não é a service-linked: a service-linked não alcança balde de outra
# conta e não entra em política de bucket com nome previsível, e a política do
# lake-bronze-silver a nomeia.
resource "aws_iam_role" "registro" {
  name = "lf-registro-plataforma-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lakeformation.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "acessa_lake" {
  name = "acessa-lake"
  role = aws_iam_role.registro.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "OsBaldesRegistrados"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetBucketLocation"]
        Resource = flatten([for arn in values(var.buckets_registrados) : [arn, "${arn}/*"]])
      },
      {
        Sid      = "AChaveDoPlano"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_lakeformation_resource" "camada" {
  for_each = var.buckets_registrados

  arn      = each.value
  role_arn = aws_iam_role.registro.arn

  depends_on = [aws_iam_role_policy.acessa_lake, aws_lakeformation_data_lake_settings.estas]
}

resource "aws_glue_job" "bronze_para_silver" {
  for_each = var.jobs_silver

  name              = each.key
  role_arn          = var.role_jobs_arn
  glue_version      = "5.0"
  worker_type       = "G.1X"
  number_of_workers = each.value.workers

  command {
    script_location = each.value.script_s3
  }

  # Iceberg é o formato do lake (04 · Decisão 1): o job já sobe com o runtime
  # e o catálogo Glue configurados, e o script só nomeia o banco e a tabela.
  default_arguments = {
    "--enable-metrics"          = "true"
    "--job-language"            = "python"
    "--datalake-formats"        = "iceberg"
    "--conf"                    = "spark.sql.catalog.glue_catalog=org.apache.iceberg.spark.SparkCatalog --conf spark.sql.catalog.glue_catalog.catalog-impl=org.apache.iceberg.aws.glue.GlueCatalog --conf spark.sql.catalog.glue_catalog.io-impl=org.apache.iceberg.aws.s3.S3FileIO --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions"
    "--DATABASE_ORIGEM"         = aws_glue_catalog_database.bronze.name
    "--DATABASE_DESTINO"        = aws_glue_catalog_database.silver.name
    "--continuous-log-logGroup" = var.log_group_jobs
  }
}
