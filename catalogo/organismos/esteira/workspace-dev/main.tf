# Organismo workspace-dev (15·D8): o laptop é terminal. Uma unit por pessoa
# (convergência do catálogo: for_each central seria state compartilhado e blast
# radius de todos). Acesso só por Session Manager; nenhuma porta de entrada, e
# por isso nenhum par de chave.
#
# A imagem chega por variável, e não por `most_recent` com filtro de nome:
# resolver a imagem em tempo de apply faz a máquina renascer diferente num
# apply de rotina, sem ninguém decidir isso. A escolha é de quem desenha, e a
# change `imagem-escolhida-no-desenho` a leva para dentro da ferramenta.

resource "aws_iam_role" "workspace" {
  name = "workspace-${var.dev}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.workspace.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "workspace" {
  name = "workspace-${var.dev}"
  role = aws_iam_role.workspace.name
}

resource "aws_security_group" "sem_entrada" {
  name   = "workspace-${var.dev}"
  vpc_id = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # saída pelo plano; egress inspecionado no hub
  }
}

resource "aws_instance" "workspace" {
  ami                    = var.ami
  instance_type          = var.tamanho
  subnet_id              = var.subnet_id
  iam_instance_profile   = aws_iam_instance_profile.workspace.name
  vpc_security_group_ids = [aws_security_group.sem_entrada.id]

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size = var.disco_gb
    encrypted   = true
    kms_key_id  = var.kms_key_arn
  }

  tags = {
    Name = "workspace-${var.dev}"
    dono = var.dev
    ttl  = var.ttl
  }
}

# Sessão cifrada com chave da instituição exige que a própria máquina possa
# usar a chave: o Session Manager negocia a chave de dados com a identidade da
# INSTÂNCIA, e sem esta permissão a sessão morre no aperto de mão com
# "Fetching data key failed", que não fala em política nenhuma.
#
# Chave em outra conta precisa dos dois lados: a policy dela admite a
# Organization, e esta política admite a chave. Faltando qualquer um, o mesmo
# erro.
resource "aws_iam_role_policy" "sessao_kms" {
  count = var.kms_sessao_ssm_arn == null ? 0 : 1

  name = "sessao-kms"
  role = aws_iam_role.workspace.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
      Resource = var.kms_sessao_ssm_arn
    }]
  })
}
