# Organismo esteira-hostedzone: ponte de escrita DNS entre a conta network
# (dona de dev.interno/hml.interno) e as contas de workload
# (as contas de não-produção dos domínios).
#
# A role esteira-hostedzone já existe na conta network, referenciada por ARN
# nas células `oidc-servico` dos domínios e em `ambiente-efemero/papel_dns_arn`.
# Este organismo passa a governá-la por Terraform.

# IMPORT, não create: sem isto, o apply falha com EntityAlreadyExists.
import {
  to = aws_iam_role.esta
  id = "esteira-hostedzone"
}

# Nome real confirmado (aws iam list-role-policies):
# "esteira-hostedzonePolicy" — não o nome que este código teria escolhido
# por padrão.
import {
  to = aws_iam_role_policy.escreve_zona
  id = "esteira-hostedzone:esteira-hostedzonePolicy"
}

resource "aws_iam_role" "esta" {
  name                 = "esteira-hostedzone"
  max_session_duration = 3600

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { AWS = var.contas_confiadas }
    }]
  })
}

# Nome e conteúdo confirmados contra a policy real (aws iam get-role-policy).
# route53:GetChange entra num statement próprio,
# sem Resource por zona: ChangeResourceRecordSets é assíncrona e devolve um
# ID de mudança (change/*), não de zona — GetChange não aceita
# "hostedzone/*" como Resource, só "change/*".
resource "aws_iam_role_policy" "escreve_zona" {
  name = "esteira-hostedzonePolicy"
  role = aws_iam_role.esta.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:GetHostedZone",
          "route53:ChangeResourceRecordSets",
          "route53:ListResourceRecordSets",
          "route53:GetChange",
        ]
        Resource = [for id in var.zona_ids : "arn:aws:route53:::hostedzone/${id}"]
      },
      {
        Effect   = "Allow"
        Action   = "route53:GetChange"
        Resource = "arn:aws:route53:::change/*"
      },
    ]
  })
}
