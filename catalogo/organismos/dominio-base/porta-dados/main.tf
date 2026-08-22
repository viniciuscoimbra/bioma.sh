# Organismo porta-dados (04.1): registra o gold no Lake Formation com role
# própria. É o pré-requisito dos grants (acesso-lake): sem registro, não há
# permissão fina por tabela.

# A conta do domínio também é um catálogo do Lake Formation, e nasce com o
# default de fábrica: IAM_ALLOWED_PRINCIPALS com ALL em banco e tabela, que é o
# mesmo que não ter enforcement. Registrar o gold sem fechar isso deixa o grant
# como decoração: qualquer principal com Glue e S3 lê tudo. O fechamento mora
# aqui porque é a primeira célula do domínio que toca o Lake Formation.
data "aws_caller_identity" "quem_aplica" {}

locals {
  # o mesmo raciocínio da governanca: quem aplica precisa seguir admin do lake
  # desta conta, senão o apply se configura para fora e a PRÓXIMA peça (a tag
  # da classificacao-lake, o grant do acesso-lake) morre com Insufficient Lake
  # Formation permission(s). A troca do sts assumed-role pelo arn de iam role é
  # porque o Lake Formation registra a role, e não a sessão dela.
  administradores = distinct(concat(
    var.administradores_arns,
    var.incluir_quem_aplica ? [replace(data.aws_caller_identity.quem_aplica.arn, "/:sts::(\\d+):assumed-role/([^/]+)/.*/", ":iam::$1:role/$2")] : [],
  ))
}

resource "aws_lakeformation_data_lake_settings" "estas" {
  admins = local.administradores

  create_database_default_permissions {
    permissions = []
    principal   = "IAM_ALLOWED_PRINCIPALS"
  }
  create_table_default_permissions {
    permissions = []
    principal   = "IAM_ALLOWED_PRINCIPALS"
  }
}

resource "aws_iam_role" "registro" {
  name = "lf-registro-${var.dominio}-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lakeformation.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "acessa_gold" {
  name = "acessa-gold"
  role = aws_iam_role.registro.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [var.bucket_gold_arn, "${var.bucket_gold_arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_lakeformation_resource" "gold" {
  arn      = var.bucket_gold_arn
  role_arn = aws_iam_role.registro.arn

  depends_on = [aws_iam_role_policy.acessa_gold, aws_lakeformation_data_lake_settings.estas]
}
