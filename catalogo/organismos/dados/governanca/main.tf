# Organismo governanca (04): Lake Formation como plano de permissão do lake
# (grants saem pela ligação acesso-lake, concedidos pelo dono do produto) e os
# jobs Glue de bronze→silver da plataforma. Jobs de gold são do domínio
# (dominio-base/job-produto-gold).

resource "aws_lakeformation_data_lake_settings" "estas" {
  admins = var.administradores_arns

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

resource "aws_lakeformation_lf_tag" "classificacao" {
  for_each = var.lf_tags

  key    = each.key
  values = each.value
}

resource "aws_glue_catalog_database" "silver" {
  name = "silver_${var.plano}"

  # o catálogo guarda a definição das tabelas que a esteira cria; destruí-lo
  # apaga o mapa do lake sem tocar um byte de dado
  lifecycle { prevent_destroy = true }
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

  default_arguments = {
    "--enable-metrics"   = "true"
    "--job-language"     = "python"
    "--DATABASE_DESTINO" = aws_glue_catalog_database.silver.name
  }
}
