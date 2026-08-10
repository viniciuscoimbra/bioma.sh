# A raiz do live: o que toda célula herda por `include "root"`. Sem ele o
# terragrunt não acha onde guardar estado nem como falar com a nuvem.

locals {
  modo     = get_env("TG_MODO", "aws")
  regiao   = get_env("AWS_DEFAULT_REGION", "sa-east-1")
  emulador = get_env("BIOMA_EMULADOR", "http://localhost:4566")
  emulados = ["acm", "apigateway", "apigatewayv2", "athena", "backup", "cloudformation", "cloudtrail", "cloudwatch", "codebuild", "codepipeline", "config", "dynamodb", "ec2", "ecr", "ecs", "eks", "elasticache", "events", "firehose", "glue", "iam", "kafka", "kinesis", "kms", "lambda", "logs", "rds", "route53", "s3", "scheduler", "secretsmanager", "sfn", "sns", "sqs", "ssm", "sts", "wafv2"]

  # A PR que está sendo provisionada, quando houver. Ela prefixa a chave do
  # estado e etiqueta todo recurso: sem esse prefixo, o plano da PR enxergaria
  # o estado da infraestrutura permanente da mesma conta, e o destroy do
  # fechamento viraria roleta.
  pr      = get_env("PR_NUMBER", "")
  efemero = local.pr != ""
  prefixo = local.efemero ? "efemero/pr-${local.pr}" : "permanente"

  # O balde do estado. Vazio mantém o estado em disco, que é o padrão de quem
  # está desenhando; preenchido, o estado vai para o S3 da instância.
  balde  = get_env("TG_BALDE_ESTADO", "")
  remoto = local.balde != ""

  # A faxina precisa achar o que expirou sem varrer a conta inteira, e a role
  # da esteira precisa condicionar por tag. As duas coisas vivem daqui.
  ttl_horas = get_env("BIOMA_TTL_HORAS", "72")
  marcas = merge(
    { Origem = "bioma.sh" },
    local.efemero ? {
      Ephemeral = "true"
      PRNumber  = local.pr
      CriadoEm  = timestamp()
      TTLHoras  = local.ttl_horas
    } : {},
  )
}

# Onde o estado mora. Em disco por padrão, porque a árvore nasce de um desenho
# e ainda não é repositório de instância. Com TG_BALDE_ESTADO preenchido, vai
# para o S3, e a chave começa no prefixo: `permanente/...` para o que dura,
# `efemero/pr-1234/...` para a stack de uma PR. É esse prefixo que garante que
# o destroy do fechamento não enxergue um único recurso da infraestrutura
# permanente da mesma conta.
remote_state {
  backend = local.remoto ? "s3" : "local"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite"
  }
  config = local.remoto ? {
    bucket       = local.balde
    key          = "${local.prefixo}/${path_relative_to_include()}/terraform.tfstate"
    region       = local.regiao
    encrypt      = true
    use_lockfile = true
  } : {
    path = "${get_parent_terragrunt_dir()}/.estado/${local.prefixo}/${path_relative_to_include()}/terraform.tfstate"
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<-EOF
    provider "aws" {
      region = "${local.regiao}"

      default_tags {
        tags = ${jsonencode(local.marcas)}
      }

%{ if local.modo == "local" ~}
      access_key                  = "teste"
      secret_key                  = "teste"
      skip_credentials_validation = true
      skip_metadata_api_check     = true
      skip_requesting_account_id  = true
      s3_use_path_style           = true
      endpoints {
%{ for s in local.emulados ~}
        ${s} = "${local.emulador}"
%{ endfor ~}
      }
%{ endif ~}
    }
  EOF
}
