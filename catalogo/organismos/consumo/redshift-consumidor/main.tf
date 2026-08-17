# Organismo consumo/redshift-consumidor (04): Redshift Serverless para o BI.
# Consome o lake por datashare/grant do dono (acesso-lake); RPU com teto.

# A role que o Redshift assume para consultar o lake pelo Lake Formation (04 ·
# Decisão 7): ela pede a credencial vendida (`GetDataAccess`) e lê o catálogo;
# o S3 ela não toca direto, e a política de bucket do lake a nega se tentar. O
# grant sobre as tabelas do gold chega por acesso-lake, concedido pelo dono do
# produto a esta role.
resource "aws_iam_role" "lake" {
  name = "redshift-lake-${var.consumidor}-${var.plano}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = ["redshift.amazonaws.com", "redshift-serverless.amazonaws.com"] }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lake" {
  name = "consulta-o-lake"
  role = aws_iam_role.lake.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "PedeCredencialAoLakeFormation"
        Effect   = "Allow"
        Action   = ["lakeformation:GetDataAccess"]
        Resource = "*" # a ação não aceita recurso; quem recorta é o grant do LF
      },
      {
        # leitura do catálogo, e só leitura: o Redshift monta o schema externo a
        # partir dela. Sem curinga de conta: os links entre contas moram no
        # catálogo local (ligação link-catalogo).
        Sid    = "LeOCatalogo"
        Effect = "Allow"
        Action = ["glue:GetDatabase", "glue:GetDatabases", "glue:GetTable", "glue:GetTables",
        "glue:GetPartition", "glue:GetPartitions", "glue:SearchTables"]
        Resource = var.recursos_do_catalogo
      },
      {
        Sid      = "AChaveDoPlano"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:DescribeKey"]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_redshiftserverless_namespace" "este" {
  namespace_name        = "${var.consumidor}-${var.plano}"
  kms_key_id            = var.kms_key_arn
  iam_roles             = concat([aws_iam_role.lake.arn], var.roles_acesso_lake)
  default_iam_role_arn  = aws_iam_role.lake.arn
  manage_admin_password = true
}

resource "aws_redshiftserverless_workgroup" "este" {
  namespace_name = aws_redshiftserverless_namespace.este.namespace_name
  workgroup_name = "${var.consumidor}-${var.plano}"
  base_capacity  = var.rpu_base
  max_capacity   = var.rpu_teto

  subnet_ids          = var.subnet_ids
  security_group_ids  = var.security_group_ids
  publicly_accessible = false
}
