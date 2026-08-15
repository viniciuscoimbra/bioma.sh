# Organismo score-endpoint (06): o endpoint de inferência do score. O modelo
# (artefato em S3) vem da esteira de ML; a receita mantém o endpoint e a
# config, e trocar versão de modelo é trocar a config, sem downtime.

resource "aws_iam_role" "execucao" {
  name = "score-execucao-${var.ambiente}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sagemaker.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "le_modelo" {
  name = "le-modelo"
  role = aws_iam_role.execucao.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${var.bucket_modelos_arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.kms_key_arn
      },
      {
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData", "logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_sagemaker_model" "score" {
  name               = "score-${var.ambiente}-${var.versao_modelo}"
  execution_role_arn = aws_iam_role.execucao.arn

  primary_container {
    image          = var.imagem_inferencia
    model_data_url = var.modelo_s3_url
  }

  vpc_config {
    subnets            = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
}

resource "aws_sagemaker_endpoint_configuration" "esta" {
  name = "score-${var.ambiente}-${var.versao_modelo}"

  production_variants {
    variant_name           = "principal"
    model_name             = aws_sagemaker_model.score.name
    instance_type          = var.instancia
    initial_instance_count = var.replicas
  }

  kms_key_arn = var.kms_key_arn
}

resource "aws_sagemaker_endpoint" "este" {
  name                 = "score-${var.ambiente}"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.esta.name
}
