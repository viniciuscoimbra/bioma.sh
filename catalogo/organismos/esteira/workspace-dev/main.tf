# Organismo workspace-dev (15·D8): o laptop é terminal. Uma unit por
# desenvolvedor (convergência do catálogo: for_each central seria state
# compartilhado e blast radius de todos). Acesso só por Session Manager,
# depois da VPN; nenhuma porta de entrada.

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-arm64"]
  }
}

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
  ami                    = data.aws_ami.al2023.id
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
