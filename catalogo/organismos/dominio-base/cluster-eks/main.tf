# Organismo cluster-eks: um cluster Kubernetes gerenciado, privado, com os
# add-ons de base e os papéis IRSA que os controladores de plataforma exigem
# para falar com a nuvem. Quem batiza o cluster é a célula. A rede chega pronta
# pela dependência (vpc_id e subnets privadas), nunca por consulta à nuvem. A
# capacidade de verdade vem do Karpenter, que a célula aplica ao cluster depois:
# o node group daqui existe só para segurar o controlador até haver nó.
#
# cria: plano de controle EKS, chave KMS do envelope dos segredos, log group do
#   plano de controle, provedor OIDC, node group de bootstrap, grupo de segurança
#   dos nós, add-ons (vpc-cni, kube-proxy, coredns, EBS CSI, EFS CSI,
#   metrics-server), papéis IRSA (Karpenter controlador e nó, Load Balancer
#   Controller, EBS CSI, EFS CSI, External Secrets, external-dns e vpc-cni IPv6
#   quando pedidos), fila e regras de interrupção do Karpenter
# nao cria: a VPC e as subnets (receita de rede), os NodePools e EC2NodeClasses do
#   Karpenter (aplicados ao cluster, não à nuvem), os charts dos controladores, as
#   access entries de gente (só a do nó do Karpenter nasce aqui)
# recebe: nome, dominio, ambiente, vpc_id, subnets_privadas, versao_kubernetes e
#   o domínio da zona de external-dns quando houver
# publica: nome, endpoint e autoridade certificadora do cluster, emissor e ARN do
#   provedor OIDC, os dois grupos de segurança, os ARNs dos papéis IRSA, o nome do
#   papel de nó do Karpenter e da fila de interrupção, a zona do external-dns
# durabilidade: estavel. Apagar e recriar devolve um cluster equivalente e derruba
#   toda carga que estava rodando nele. A chave KMS que nasce aqui envelopa os
#   segredos do etcd e não guarda conteúdo próprio: recriar não perde nada que a
#   recriação do cluster já não perca, e é por isso que ela fica sem trava.
# local: fora. O emulador local não responde pelo plano de controle do EKS nem
#   pelo provedor OIDC, e sem eles nenhum papel IRSA fecha.
# custo: alto. Plano de controle por hora, mais os nós de bootstrap, mais os nós
#   que o Karpenter cria depois.
# premissas: as subnets são privadas e alcançam a API da AWS (endpoints de VPC ou
#   saída controlada); as mesmas subnets carregam a tag karpenter.sh/discovery com
#   o nome do cluster, porque o EC2NodeClass seleciona subnet por tag e, sem ela,
#   nenhum nó sobe e nada acusa erro (a tag do grupo de segurança nasce aqui, a da
#   subnet é da receita de rede); o Karpenter, o Load Balancer Controller, o
#   external-dns, o External Secrets e o metrics-server são instalados dentro do
#   cluster por outra esteira, e aqui só nascem as permissões que eles assumem.

data "aws_caller_identity" "esta" {}

# A região sai do provider, e não de uma variável: as políticas do Karpenter
# escopam ARN por região, e uma variável que divergisse da região do provider
# geraria política que não concede nada, planejando limpo.
data "aws_region" "esta" {}

locals {
  # A zona, a política e o papel do external-dns andam juntos de propósito: a
  # política é escopada no ARN da zona, então papel sem zona ou seria inútil ou
  # teria que ser liberado em todas as hosted zones da conta.
  cria_dns_externo = var.zona_dns_externo != ""

  # A chave entra no nome da regra do EventBridge, que para em 64 caracteres, e o
  # nome do cluster leva até 28. Sobram 25 para a chave mais longa, e é por isso
  # que "rebalanceamento" não vira "recomendacao_de_rebalanceamento": o estouro
  # só aparece no apply, com o cluster já de pé.
  eventos_de_interrupcao = {
    interrupcao_spot = {
      descricao = "Karpenter: aviso de interrupção de instância spot"
      padrao    = jsonencode({ source = ["aws.ec2"], "detail-type" = ["EC2 Spot Instance Interruption Warning"] })
    }
    rebalanceamento = {
      descricao = "Karpenter: recomendação de rebalanceamento de instância"
      padrao    = jsonencode({ source = ["aws.ec2"], "detail-type" = ["EC2 Instance Rebalance Recommendation"] })
    }
    mudanca_de_estado = {
      descricao = "Karpenter: mudança de estado de instância"
      padrao    = jsonencode({ source = ["aws.ec2"], "detail-type" = ["EC2 Instance State-change Notification"] })
    }
    mudanca_programada = {
      descricao = "Karpenter: evento programado do AWS Health"
      padrao    = jsonencode({ source = ["aws.health"], "detail-type" = ["AWS Health Event"] })
    }
  }

  etiquetas = { dominio = var.dominio, ambiente = var.ambiente }
}

resource "aws_iam_role" "plano_de_controle" {
  name = "${var.nome}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "plano_de_controle_eks" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.plano_de_controle.name
}

# O vpc-resource-controller, que roda no plano de controle, usa este papel para
# atribuir endereços IPv4 secundários a nó Windows. Sem a política, o pool quente
# de IP fica vazio e o pod Windows entra em laço de FailedCreatePodSandBox. Anda
# com a variável ipam_windows, que liga o mesmo comportamento no add-on vpc-cni.
resource "aws_iam_role_policy_attachment" "plano_de_controle_vpc_resource_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.plano_de_controle.name
}

resource "aws_kms_key" "segredos" {
  description             = "envelope dos segredos do Kubernetes em ${var.nome}"
  enable_key_rotation     = true
  deletion_window_in_days = 30

  tags = merge(local.etiquetas, { Name = "${var.nome}-eks-secrets" })
}

resource "aws_kms_alias" "segredos" {
  name          = "alias/eks-${var.nome}"
  target_key_id = aws_kms_key.segredos.key_id
}

# O plano de controle cria o grant que cifra e decifra os segredos do etcd, e
# quem cria o grant é este papel. Sem esta permissão o cluster nasce e a
# gravação de Secret falha depois, já com carga em cima.
resource "aws_iam_role_policy" "plano_de_controle_kms" {
  name = "${var.nome}-cluster-kms"
  role = aws_iam_role.plano_de_controle.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:DescribeKey",
        "kms:CreateGrant",
        "kms:ListGrants"
      ]
      Resource = aws_kms_key.segredos.arn
    }]
  })
}

# O log group nasce antes do cluster para a retenção ser nossa. Deixado para o
# EKS criar, ele vem sem expiração e guarda o log de auditoria para sempre.
resource "aws_cloudwatch_log_group" "plano_de_controle" {
  name              = "/aws/eks/${var.nome}/cluster"
  retention_in_days = var.retencao_de_log_dias

  tags = local.etiquetas
}

resource "aws_eks_cluster" "este" {
  name     = var.nome
  role_arn = aws_iam_role.plano_de_controle.arn
  version  = var.versao_kubernetes

  enabled_cluster_log_types = var.tipos_de_log

  vpc_config {
    subnet_ids              = var.subnets_privadas
    endpoint_private_access = var.endpoint_privado
    endpoint_public_access  = var.endpoint_publico
    public_access_cidrs     = var.cidrs_do_endpoint_publico
  }

  kubernetes_network_config {
    ip_family = var.familia_de_ip
  }

  access_config {
    authentication_mode                         = var.modo_de_autenticacao
    bootstrap_cluster_creator_admin_permissions = var.criador_vira_admin
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.segredos.arn
    }
    resources = ["secrets"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.plano_de_controle_eks,
    aws_iam_role_policy.plano_de_controle_kms,
    aws_cloudwatch_log_group.plano_de_controle,
  ]

  tags = local.etiquetas
}

# O emissor OIDC do cluster registrado como provedor de identidade da conta: é
# ele que faz o service account do pod virar papel IAM (IRSA). O thumbprint fica
# de fora porque o provider já o resolve para emissor de EKS, e fixá-lo à mão
# quebra na rotação do certificado da AWS.
resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list = ["sts.amazonaws.com"]
  url            = aws_eks_cluster.este.identity[0].oidc[0].issuer

  tags = merge(local.etiquetas, { Name = "${var.nome}-irsa" })
}

resource "aws_iam_role" "nos" {
  name = "${var.nome}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "nos_worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.nos.name
}

resource "aws_iam_role_policy_attachment" "nos_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.nos.name
}

resource "aws_iam_role_policy_attachment" "nos_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.nos.name
}

resource "aws_security_group" "nos" {
  name        = "${var.nome}-node-sg"
  description = "Grupo de seguranca dos nos do cluster"
  vpc_id      = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(local.etiquetas, {
    # A descoberta do Karpenter casa por valor exato desta tag. Divergir do nome
    # do cluster não dá erro: o Karpenter simplesmente não acha grupo nenhum e
    # nenhum nó sobe. Por isso a tag lê o cluster, e não a variável.
    "karpenter.sh/discovery" = aws_eks_cluster.este.name
  })
}

resource "aws_vpc_security_group_ingress_rule" "nos_entre_si" {
  security_group_id            = aws_security_group.nos.id
  description                  = "Trafego entre nos do cluster"
  referenced_security_group_id = aws_security_group.nos.id
  ip_protocol                  = "-1"
}

resource "aws_vpc_security_group_ingress_rule" "cluster_a_partir_dos_nos" {
  security_group_id            = aws_eks_cluster.este.vpc_config[0].cluster_security_group_id
  referenced_security_group_id = aws_security_group.nos.id
  ip_protocol                  = "-1"
  description                  = "Trafego dos nos do Karpenter para o endpoint privado do cluster"
}

resource "aws_vpc_security_group_ingress_rule" "nos_a_partir_do_cluster" {
  security_group_id            = aws_security_group.nos.id
  referenced_security_group_id = aws_eks_cluster.este.vpc_config[0].cluster_security_group_id
  ip_protocol                  = "-1"
  description                  = "Trafego do cluster para os nos do Karpenter (exec e logs)"
}

# Este node group existe só para hospedar o controlador do Karpenter e os
# add-ons que precisam de um nó antes de haver capacidade. A carga roda nos nós
# que o Karpenter cria a partir dos NodePools: não cresça este para atender
# demanda, porque ele não encolhe sozinho e o custo fica fixo.
resource "aws_eks_node_group" "bootstrap" {
  cluster_name    = aws_eks_cluster.este.name
  node_group_name = "bootstrap"
  node_role_arn   = aws_iam_role.nos.arn
  subnet_ids      = var.subnets_privadas

  scaling_config {
    desired_size = var.bootstrap_desejado
    max_size     = var.bootstrap_maximo
    min_size     = var.bootstrap_minimo
  }

  instance_types = var.tipos_de_instancia

  depends_on = [
    aws_iam_role_policy_attachment.nos_worker,
    aws_iam_role_policy_attachment.nos_cni,
    aws_iam_role_policy_attachment.nos_ecr,
  ]

  tags = local.etiquetas
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "vpc-cni"
  addon_version               = var.versao_vpc_cni
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"
  service_account_role_arn    = var.familia_de_ip == "ipv6" ? aws_iam_role.vpc_cni_ipv6[0].arn : null

  configuration_values = var.ipam_windows ? jsonencode({ enableWindowsIpam = "true" }) : null
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "kube-proxy"
  addon_version               = var.versao_kube_proxy
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"
}

# Os add-ons abaixo rodam em pod, e pod precisa de nó: sem o node group de
# bootstrap eles ficam pendentes e o apply espera até estourar o tempo.
resource "aws_eks_addon" "coredns" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "coredns"
  addon_version               = var.versao_coredns
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"

  depends_on = [aws_eks_node_group.bootstrap]
}

# Os drivers CSI entram como add-on gerenciado, e não por chart, para todo
# cluster receber a mesma base. As políticas de confiança dos papéis apontam os
# service accounts padrão do add-on (kube-system/{ebs,efs}-csi-controller-sa):
# instalar por chart com outro service account faz o AssumeRole falhar calado.
resource "aws_eks_addon" "ebs_csi" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "aws-ebs-csi-driver"
  addon_version               = var.versao_ebs_csi
  service_account_role_arn    = aws_iam_role.ebs_csi.arn
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"

  depends_on = [aws_eks_node_group.bootstrap]
}

resource "aws_eks_addon" "efs_csi" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "aws-efs-csi-driver"
  addon_version               = var.versao_efs_csi
  service_account_role_arn    = aws_iam_role.efs_csi.arn
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"

  depends_on = [aws_eks_node_group.bootstrap]
}

resource "aws_eks_addon" "metrics_server" {
  cluster_name                = aws_eks_cluster.este.name
  addon_name                  = "metrics-server"
  addon_version               = var.versao_metrics_server
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"

  depends_on = [aws_eks_node_group.bootstrap]
}

resource "aws_iam_role" "karpenter_no" {
  name = "KarpenterNodeRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "karpenter_no_worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.karpenter_no.name
}

resource "aws_iam_role_policy_attachment" "karpenter_no_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.karpenter_no.name
}

resource "aws_iam_role_policy_attachment" "karpenter_no_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.karpenter_no.name
}

resource "aws_iam_role_policy_attachment" "karpenter_no_ssm" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.karpenter_no.name
}

# Sem esta access entry o nó que o Karpenter cria sobe na conta e nunca entra no
# cluster: o kubelet apresenta um papel que o plano de controle não conhece.
resource "aws_eks_access_entry" "karpenter_no" {
  cluster_name  = aws_eks_cluster.este.name
  principal_arn = aws_iam_role.karpenter_no.arn
  type          = "EC2_LINUX"
}

resource "aws_sqs_queue" "karpenter_interrupcao" {
  name                      = "karpenter-${var.nome}"
  message_retention_seconds = 300
  sqs_managed_sse_enabled   = true

  tags = local.etiquetas
}

resource "aws_sqs_queue_policy" "karpenter_interrupcao" {
  queue_url = aws_sqs_queue.karpenter_interrupcao.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = ["events.amazonaws.com", "sqs.amazonaws.com"] }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.karpenter_interrupcao.arn
    }]
  })
}

resource "aws_cloudwatch_event_rule" "karpenter_interrupcao" {
  for_each = local.eventos_de_interrupcao

  name          = "karpenter-${each.key}-${var.nome}"
  description   = each.value.descricao
  event_pattern = each.value.padrao

  tags = local.etiquetas
}

resource "aws_cloudwatch_event_target" "karpenter_interrupcao" {
  for_each = local.eventos_de_interrupcao

  rule      = aws_cloudwatch_event_rule.karpenter_interrupcao[each.key].name
  target_id = "KarpenterInterruptionQueueTarget"
  arn       = aws_sqs_queue.karpenter_interrupcao.arn
}

resource "aws_iam_policy" "karpenter_controlador" {
  name = "KarpenterControllerPolicy-${var.nome}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowScopedEC2InstanceAccessActions"
        Effect = "Allow"
        Resource = [
          "arn:aws:ec2:${data.aws_region.esta.region}::image/*",
          "arn:aws:ec2:${data.aws_region.esta.region}::snapshot/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:security-group/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:subnet/*",
        ]
        Action = ["ec2:RunInstances", "ec2:CreateFleet"]
      },
      {
        Sid      = "AllowScopedEC2LaunchTemplateAccessActions"
        Effect   = "Allow"
        Resource = "arn:aws:ec2:${data.aws_region.esta.region}:*:launch-template/*"
        Action   = ["ec2:RunInstances", "ec2:CreateFleet"]
        Condition = {
          StringEquals = { "aws:ResourceTag/kubernetes.io/cluster/${var.nome}" = "owned" }
          StringLike   = { "aws:ResourceTag/karpenter.sh/nodepool" = "*" }
        }
      },
      {
        Sid    = "AllowScopedEC2InstanceActionsWithTags"
        Effect = "Allow"
        Resource = [
          "arn:aws:ec2:${data.aws_region.esta.region}:*:fleet/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:instance/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:volume/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:network-interface/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:launch-template/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:spot-instances-request/*",
        ]
        Action = ["ec2:RunInstances", "ec2:CreateFleet", "ec2:CreateLaunchTemplate"]
        Condition = {
          StringEquals = { "aws:RequestTag/kubernetes.io/cluster/${var.nome}" = "owned" }
          StringLike   = { "aws:RequestTag/karpenter.sh/nodepool" = "*" }
        }
      },
      {
        Sid    = "AllowScopedResourceCreationTagging"
        Effect = "Allow"
        Resource = [
          "arn:aws:ec2:${data.aws_region.esta.region}:*:fleet/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:instance/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:volume/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:network-interface/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:launch-template/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:spot-instances-request/*",
        ]
        Action = ["ec2:CreateTags"]
        Condition = {
          StringEquals = {
            "aws:RequestTag/kubernetes.io/cluster/${var.nome}" = "owned"
            "ec2:CreateAction"                                 = ["RunInstances", "CreateFleet", "CreateLaunchTemplate"]
          }
          StringLike = { "aws:RequestTag/karpenter.sh/nodepool" = "*" }
        }
      },
      {
        Sid      = "AllowScopedResourceTagging"
        Effect   = "Allow"
        Resource = "arn:aws:ec2:${data.aws_region.esta.region}:*:instance/*"
        Action   = ["ec2:CreateTags"]
        Condition = {
          StringEquals                = { "aws:ResourceTag/kubernetes.io/cluster/${var.nome}" = "owned" }
          StringLike                  = { "aws:ResourceTag/karpenter.sh/nodepool" = "*" }
          StringEqualsIfExists        = { "aws:RequestTag/eks:eks-cluster-name" = var.nome }
          "ForAllValues:StringEquals" = { "aws:TagKeys" = ["karpenter.sh/nodeclaim", "Name", "eks:eks-cluster-name"] }
        }
      },
      {
        Sid    = "AllowScopedDeletion"
        Effect = "Allow"
        Resource = [
          "arn:aws:ec2:${data.aws_region.esta.region}:*:instance/*",
          "arn:aws:ec2:${data.aws_region.esta.region}:*:launch-template/*",
        ]
        Action = ["ec2:TerminateInstances", "ec2:DeleteLaunchTemplate"]
        Condition = {
          StringEquals = { "aws:ResourceTag/kubernetes.io/cluster/${var.nome}" = "owned" }
          StringLike   = { "aws:ResourceTag/karpenter.sh/nodepool" = "*" }
        }
      },
      {
        Sid      = "AllowRegionalReadActions"
        Effect   = "Allow"
        Resource = "*"
        Action = [
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeImages",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceTypeOfferings",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSpotPriceHistory",
          "ec2:DescribeSubnets",
        ]
        Condition = { StringEquals = { "aws:RequestedRegion" = data.aws_region.esta.region } }
      },
      {
        Sid      = "AllowSSMReadActions"
        Effect   = "Allow"
        Resource = "arn:aws:ssm:${data.aws_region.esta.region}::parameter/aws/service/*"
        Action   = ["ssm:GetParameter"]
      },
      {
        Sid      = "AllowPricingReadActions"
        Effect   = "Allow"
        Resource = "*"
        Action   = ["pricing:GetProducts"]
      },
      {
        Sid      = "AllowInterruptionQueueActions"
        Effect   = "Allow"
        Resource = aws_sqs_queue.karpenter_interrupcao.arn
        Action   = ["sqs:DeleteMessage", "sqs:GetQueueAttributes", "sqs:GetQueueUrl", "sqs:ReceiveMessage"]
      },
      {
        Sid       = "AllowPassingInstanceRole"
        Effect    = "Allow"
        Resource  = aws_iam_role.karpenter_no.arn
        Action    = ["iam:PassRole"]
        Condition = { StringEquals = { "iam:PassedToService" = "ec2.amazonaws.com" } }
      },
      {
        Sid      = "AllowScopedInstanceProfileCreationActions"
        Effect   = "Allow"
        Resource = "arn:aws:iam::${data.aws_caller_identity.esta.account_id}:instance-profile/*"
        Action   = ["iam:CreateInstanceProfile"]
        Condition = {
          StringEquals = {
            "aws:RequestTag/kubernetes.io/cluster/${var.nome}" = "owned"
            "aws:RequestTag/eks:eks-cluster-name"              = var.nome
            "aws:RequestTag/topology.kubernetes.io/region"     = data.aws_region.esta.region
          }
          StringLike = { "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass" = "*" }
        }
      },
      {
        Sid      = "AllowScopedInstanceProfileTagActions"
        Effect   = "Allow"
        Resource = "arn:aws:iam::${data.aws_caller_identity.esta.account_id}:instance-profile/*"
        Action   = ["iam:TagInstanceProfile"]
        Condition = {
          StringEquals = {
            "aws:ResourceTag/kubernetes.io/cluster/${var.nome}" = "owned"
            "aws:ResourceTag/topology.kubernetes.io/region"     = data.aws_region.esta.region
            "aws:RequestTag/kubernetes.io/cluster/${var.nome}"  = "owned"
            "aws:RequestTag/eks:eks-cluster-name"               = var.nome
            "aws:RequestTag/topology.kubernetes.io/region"      = data.aws_region.esta.region
          }
          StringLike = {
            "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass" = "*"
            "aws:RequestTag/karpenter.k8s.aws/ec2nodeclass"  = "*"
          }
        }
      },
      {
        Sid      = "AllowScopedInstanceProfileActions"
        Effect   = "Allow"
        Resource = "arn:aws:iam::${data.aws_caller_identity.esta.account_id}:instance-profile/*"
        Action   = ["iam:AddRoleToInstanceProfile", "iam:RemoveRoleFromInstanceProfile", "iam:DeleteInstanceProfile"]
        Condition = {
          StringEquals = {
            "aws:ResourceTag/kubernetes.io/cluster/${var.nome}" = "owned"
            "aws:ResourceTag/topology.kubernetes.io/region"     = data.aws_region.esta.region
          }
          StringLike = { "aws:ResourceTag/karpenter.k8s.aws/ec2nodeclass" = "*" }
        }
      },
      {
        Sid      = "AllowInstanceProfileReadActions"
        Effect   = "Allow"
        Resource = "*"
        Action   = ["iam:GetInstanceProfile", "iam:ListInstanceProfiles"]
      },
      {
        Sid      = "AllowAPIServerEndpointDiscovery"
        Effect   = "Allow"
        Resource = aws_eks_cluster.este.arn
        Action   = ["eks:DescribeCluster"]
      },
    ]
  })

  tags = local.etiquetas
}

resource "aws_iam_role" "karpenter_controlador" {
  name = "KarpenterControllerRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:karpenter:karpenter"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "karpenter_controlador" {
  policy_arn = aws_iam_policy.karpenter_controlador.arn
  role       = aws_iam_role.karpenter_controlador.name
}

resource "aws_iam_policy" "balanceador" {
  name        = "AWSLoadBalancerControllerIAMPolicy-${var.nome}"
  path        = "/"
  description = "Permissoes do AWS Load Balancer Controller"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Action    = ["iam:CreateServiceLinkedRole"]
        Resource  = "*"
        Condition = { StringEquals = { "iam:AWSServiceName" = "elasticloadbalancing.amazonaws.com" } }
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeAccountAttributes",
          "ec2:DescribeAddresses",
          "ec2:DescribeAvailabilityZones",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeVpcs",
          "ec2:DescribeVpcPeeringConnections",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeInstances",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeTags",
          "ec2:GetCoipPoolUsage",
          "ec2:DescribeCoipPools",
          "ec2:GetSecurityGroupsForVpc",
          "ec2:DescribeIpamPools",
          "ec2:DescribeRouteTables",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeLoadBalancerAttributes",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeListenerCertificates",
          "elasticloadbalancing:DescribeSSLPolicies",
          "elasticloadbalancing:DescribeRules",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetGroupAttributes",
          "elasticloadbalancing:DescribeTargetHealth",
          "elasticloadbalancing:DescribeTags",
          "elasticloadbalancing:DescribeTrustStores",
          "elasticloadbalancing:DescribeListenerAttributes",
          "elasticloadbalancing:DescribeCapacityReservation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:DescribeUserPoolClient",
          "acm:ListCertificates",
          "acm:DescribeCertificate",
          "iam:ListServerCertificates",
          "iam:GetServerCertificate",
          "waf-regional:GetWebACL",
          "waf-regional:GetWebACLForResource",
          "waf-regional:AssociateWebACL",
          "waf-regional:DisassociateWebACL",
          "wafv2:GetWebACL",
          "wafv2:GetWebACLForResource",
          "wafv2:AssociateWebACL",
          "wafv2:DisassociateWebACL",
          "shield:GetSubscriptionState",
          "shield:DescribeProtection",
          "shield:CreateProtection",
          "shield:DeleteProtection"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:AuthorizeSecurityGroupIngress", "ec2:RevokeSecurityGroupIngress"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateSecurityGroup"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateTags"]
        Resource = "arn:aws:ec2:*:*:security-group/*"
        Condition = {
          StringEquals = { "ec2:CreateAction" = "CreateSecurityGroup" }
          Null         = { "aws:RequestTag/elbv2.k8s.aws/cluster" = "false" }
        }
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateTags", "ec2:DeleteTags"]
        Resource = "arn:aws:ec2:*:*:security-group/*"
        Condition = {
          Null = {
            "aws:RequestTag/elbv2.k8s.aws/cluster"  = "true"
            "aws:ResourceTag/elbv2.k8s.aws/cluster" = "false"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:DeleteSecurityGroup"
        ]
        Resource  = "*"
        Condition = { Null = { "aws:ResourceTag/elbv2.k8s.aws/cluster" = "false" } }
      },
      {
        Effect    = "Allow"
        Action    = ["elasticloadbalancing:CreateLoadBalancer", "elasticloadbalancing:CreateTargetGroup"]
        Resource  = "*"
        Condition = { Null = { "aws:RequestTag/elbv2.k8s.aws/cluster" = "false" } }
      },
      {
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:CreateListener",
          "elasticloadbalancing:DeleteListener",
          "elasticloadbalancing:CreateRule",
          "elasticloadbalancing:DeleteRule"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = ["elasticloadbalancing:AddTags", "elasticloadbalancing:RemoveTags"]
        Resource = [
          "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
          "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
          "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
        ]
        Condition = {
          Null = {
            "aws:RequestTag/elbv2.k8s.aws/cluster"  = "true"
            "aws:ResourceTag/elbv2.k8s.aws/cluster" = "false"
          }
        }
      },
      {
        Effect = "Allow"
        Action = ["elasticloadbalancing:AddTags", "elasticloadbalancing:RemoveTags"]
        Resource = [
          "arn:aws:elasticloadbalancing:*:*:listener/net/*/*/*",
          "arn:aws:elasticloadbalancing:*:*:listener/app/*/*/*",
          "arn:aws:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
          "arn:aws:elasticloadbalancing:*:*:listener-rule/app/*/*/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:ModifyLoadBalancerAttributes",
          "elasticloadbalancing:SetIpAddressType",
          "elasticloadbalancing:SetSecurityGroups",
          "elasticloadbalancing:SetSubnets",
          "elasticloadbalancing:DeleteLoadBalancer",
          "elasticloadbalancing:ModifyTargetGroup",
          "elasticloadbalancing:ModifyTargetGroupAttributes",
          "elasticloadbalancing:DeleteTargetGroup",
          "elasticloadbalancing:ModifyListenerAttributes",
          "elasticloadbalancing:ModifyCapacityReservation",
          "elasticloadbalancing:ModifyIpPools"
        ]
        Resource  = "*"
        Condition = { Null = { "aws:ResourceTag/elbv2.k8s.aws/cluster" = "false" } }
      },
      {
        Effect = "Allow"
        Action = ["elasticloadbalancing:AddTags"]
        Resource = [
          "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
          "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
          "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
        ]
        Condition = {
          StringEquals = { "elasticloadbalancing:CreateAction" = ["CreateTargetGroup", "CreateLoadBalancer"] }
          Null         = { "aws:RequestTag/elbv2.k8s.aws/cluster" = "false" }
        }
      },
      {
        Effect   = "Allow"
        Action   = ["elasticloadbalancing:RegisterTargets", "elasticloadbalancing:DeregisterTargets"]
        Resource = "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticloadbalancing:SetWebAcl",
          "elasticloadbalancing:ModifyListener",
          "elasticloadbalancing:AddListenerCertificates",
          "elasticloadbalancing:RemoveListenerCertificates",
          "elasticloadbalancing:ModifyRule",
          "elasticloadbalancing:SetRulePriorities"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.etiquetas
}

resource "aws_iam_role" "balanceador" {
  name = "AmazonEKSLoadBalancerControllerRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "balanceador" {
  policy_arn = aws_iam_policy.balanceador.arn
  role       = aws_iam_role.balanceador.name
}

resource "aws_iam_role" "ebs_csi" {
  name = "AmazonEKS_EBS_CSI_DriverRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "ebs_csi" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  role       = aws_iam_role.ebs_csi.name
}

resource "aws_iam_role" "efs_csi" {
  name = "AmazonEKS_EFS_CSI_DriverRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:efs-csi-controller-sa"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "efs_csi" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEFSCSIDriverPolicy"
  role       = aws_iam_role.efs_csi.name
}

# O External Secrets lê segredo do Secrets Manager e do Parameter Store e o
# materializa como Secret do Kubernetes. A leitura é escopada nesta conta e
# nesta região; ListSecrets não aceita escopo por recurso e fica em "*".
resource "aws_iam_policy" "segredos_externos" {
  name        = "AmazonEKSExternalSecretsPolicy-${var.nome}"
  path        = "/"
  description = "Leitura de segredos e parametros pelo External Secrets Operator"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds",
          "secretsmanager:BatchGetSecretValue"
        ]
        Resource = ["arn:aws:secretsmanager:${data.aws_region.esta.region}:${data.aws_caller_identity.esta.account_id}:secret:*"]
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:ListSecrets"]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:DescribeParameters"
        ]
        Resource = ["arn:aws:ssm:${data.aws_region.esta.region}:${data.aws_caller_identity.esta.account_id}:parameter/*"]
      }
    ]
  })

  tags = local.etiquetas
}

resource "aws_iam_role" "segredos_externos" {
  name = "AmazonEKSExternalSecretsRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:external-secrets:external-secrets"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "segredos_externos" {
  policy_arn = aws_iam_policy.segredos_externos.arn
  role       = aws_iam_role.segredos_externos.name
}

# Hosted zone privada, associada à VPC do cluster: o nome só resolve de dentro
# da VPC, e o cluster não ganha superfície de DNS público.
resource "aws_route53_zone" "dns_externo" {
  count = local.cria_dns_externo ? 1 : 0

  name          = var.zona_dns_externo
  comment       = "Administrada pelo external-dns em ${var.nome}"
  force_destroy = false

  vpc {
    vpc_id = var.vpc_id
  }

  tags = merge(local.etiquetas, { Name = var.zona_dns_externo })
}

resource "aws_iam_policy" "dns_externo" {
  count = local.cria_dns_externo ? 1 : 0

  name        = "AmazonEKSExternalDNSPolicy-${var.nome}"
  path        = "/"
  description = "Escrita de registros na zona do cluster pelo external-dns"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["route53:ChangeResourceRecordSets"]
        Resource = [aws_route53_zone.dns_externo[0].arn]
      },
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
          "route53:ListTagsForResources"
        ]
        Resource = ["*"]
      }
    ]
  })

  tags = local.etiquetas
}

resource "aws_iam_role" "dns_externo" {
  count = local.cria_dns_externo ? 1 : 0

  name = "AmazonEKSExternalDNSRole-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:external-dns"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "dns_externo" {
  count = local.cria_dns_externo ? 1 : 0

  policy_arn = aws_iam_policy.dns_externo[0].arn
  role       = aws_iam_role.dns_externo[0].name
}

# Em IPv6 o vpc-cni deixa de usar a política gerenciada do nó e passa a precisar
# de papel próprio: a atribuição de endereço vira AssignIpv6Addresses, que
# AmazonEKS_CNI_Policy não cobre.
resource "aws_iam_policy" "vpc_cni_ipv6" {
  count = var.familia_de_ip == "ipv6" ? 1 : 0

  name        = "AmazonEKS_CNI_IPv6_Policy-${var.nome}"
  path        = "/"
  description = "Atribuicao de enderecos IPv6 aos pods pelo vpc-cni"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:AssignIpv6Addresses",
          "ec2:UnassignIpv6Addresses",
          "ec2:DescribeInstances",
          "ec2:DescribeTags",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeInstanceTypes"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateTags"]
        Resource = "arn:aws:ec2:*:*:network-interface/*"
      }
    ]
  })

  tags = local.etiquetas
}

resource "aws_iam_role" "vpc_cni_ipv6" {
  count = var.familia_de_ip == "ipv6" ? 1 : 0

  name = "AmazonEKSVPCCNIRole-IPv6-${var.nome}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRoleWithWebIdentity"
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.eks.arn }
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:kube-system:aws-node"
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = local.etiquetas
}

resource "aws_iam_role_policy_attachment" "vpc_cni_ipv6" {
  count = var.familia_de_ip == "ipv6" ? 1 : 0

  policy_arn = aws_iam_policy.vpc_cni_ipv6[0].arn
  role       = aws_iam_role.vpc_cni_ipv6[0].name
}

# Quem fala com a API do cluster, além dos nós. O grupo que o EKS cria admite o
# próprio e o dos nós, e mais ninguém: uma máquina de operação na mesma VPC
# alcança o endereço, abre a conexão TCP e para no aperto de mão TLS, com
# "handshake timeout". A mensagem não fala em grupo de segurança, e por isso o
# tempo se gasta procurando no lugar errado.
#
# É lista declarada e não faixa: quem opera o cluster é um conjunto conhecido
# de máquinas, e abrir a porta por CIDR daria acesso à API a tudo que a VPC
# hospeda.
resource "aws_vpc_security_group_ingress_rule" "api_para_operacao" {
  for_each = toset(var.grupos_que_alcancam_a_api)

  security_group_id            = aws_eks_cluster.este.vpc_config[0].cluster_security_group_id
  referenced_security_group_id = each.value
  ip_protocol                  = "tcp"
  from_port                    = 443
  to_port                      = 443
  description                  = "operacao declarada pela celula"
}

# Quem administra o cluster, por identidade nomeada. Sem isto, o único acesso
# humano é o de quem criou o cluster, que no primeiro apply é a credencial de
# dono da conta: todo mundo que precisa operar acaba usando a credencial mais
# poderosa que existe, porque é a única que o cluster reconhece.
#
# O erro de quem não está aqui é "the server has asked for the client to
# provide credentials", depois de o TLS completar. Ele não parece um problema
# de autorização, e por isso é procurado no kubeconfig.
resource "aws_eks_access_entry" "administrador" {
  for_each = toset(var.administradores)

  cluster_name  = aws_eks_cluster.este.name
  principal_arn = each.value
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "administrador" {
  for_each = toset(var.administradores)

  cluster_name  = aws_eks_cluster.este.name
  principal_arn = each.value
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope { type = "cluster" }

  depends_on = [aws_eks_access_entry.administrador]
}
