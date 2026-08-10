# Organismo consumo/redshift-consumidor (04): Redshift Serverless para o BI.
# Consome o lake por datashare/grant do dono (acesso-lake); RPU com teto.

resource "aws_redshiftserverless_namespace" "este" {
  namespace_name        = "${var.consumidor}-${var.plano}"
  kms_key_id            = var.kms_key_arn
  iam_roles             = var.roles_acesso_lake
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
