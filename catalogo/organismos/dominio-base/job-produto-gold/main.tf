# Organismo job-produto-gold (04): os jobs que materializam o produto de dado
# a partir do silver da plataforma (acesso concedido pelo contrato do produto).
# O balde e o catálogo de destino são do organismo produto-gold: job se refaz
# sem perda, produto não.

resource "aws_glue_job" "produto" {
  for_each = var.jobs

  name              = "${var.dominio}-${each.key}"
  role_arn          = var.role_jobs_arn
  glue_version      = "5.0"
  worker_type       = "G.1X"
  number_of_workers = each.value.workers

  command {
    script_location = each.value.script_s3
  }

  default_arguments = {
    "--job-language"     = "python"
    "--DATABASE_DESTINO" = var.database_gold
    "--BUCKET_DESTINO"   = var.bucket_gold
  }
}
