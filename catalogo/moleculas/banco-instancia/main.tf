# Molécula banco-instancia: o banco relacional gerenciado que não é cluster.
# Aurora resolve PostgreSQL e MySQL; a engine que o produto de prateleira exige
# (Oracle, SQL Server) só existe em instância única com espelho síncrono na
# segunda zona, e é essa a peça daqui.
#
# O que a peça decide e a célula não escolhe: cifragem ligada, sem endereço
# público, com trava de exclusão. Cifragem é decisão de criação: RDS não liga
# depois, e desligada aqui significaria destruir e recriar o banco quando
# alguém percebesse.
#
# Schema, usuário de aplicação e carga inicial são da instalação do produto,
# e não desta peça.

resource "aws_db_subnet_group" "este" {
  name       = var.nome
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "este" {
  identifier     = var.nome
  engine         = var.engine
  engine_version = var.versao_engine
  instance_class = var.classe
  license_model  = var.modelo_licenca

  # Conjunto de caracteres é decisão de criação em Oracle: o produto que vai
  # morar aqui declara o dele, e trocar depois é recriar o banco. Nas engines
  # que não o suportam o valor precisa ser nulo, ou a AWS recusa o apply.
  character_set_name = var.conjunto_caracteres != "" ? var.conjunto_caracteres : null
  # Em Oracle este é o SID, no máximo 8 caracteres. Vazio faz a AWS escolher.
  db_name = var.nome_banco != "" ? var.nome_banco : null

  allocated_storage     = var.armazenamento_gb
  max_allocated_storage = var.armazenamento_maximo_gb
  storage_type          = var.tipo_armazenamento
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  username = var.usuario_mestre
  # O valor nunca na receita nem no estado: o RDS gera e gira o segredo, e
  # quem for usá-lo pede ao Secrets Manager com permissão nomeada.
  manage_master_user_password   = true
  master_user_secret_kms_key_id = var.kms_key_arn

  db_subnet_group_name   = aws_db_subnet_group.este.name
  vpc_security_group_ids = var.security_group_ids
  # A porta que a fronteira da VPC já abre; a peça não escolhe a própria porta.
  publicly_accessible = false

  # Espelho síncrono na segunda zona. Em engine licenciada a cópia também é
  # licenciada, e por isso o valor é declarado pela célula e não derivado do
  # nome do ambiente: comparar string de ambiente foi como esta árvore já
  # marcou produção inteira como não-produção.
  multi_az = var.espelho_em_outra_zona

  backup_retention_period  = var.retencao_backup_dias
  backup_window            = var.janela_backup
  maintenance_window       = var.janela_manutencao
  copy_tags_to_snapshot    = true
  delete_automated_backups = false

  performance_insights_enabled          = true
  performance_insights_kms_key_id       = var.kms_key_arn
  performance_insights_retention_period = 7
  enabled_cloudwatch_logs_exports       = var.logs_exportados

  auto_minor_version_upgrade = true
  apply_immediately          = var.aplicar_na_hora

  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.nome}-final"

  tags = { Name = var.nome }

  # A versão menor sobe sozinha na janela de manutenção, e a célula declara só
  # a maior: o provider trata a maior como satisfeita por qualquer menor dela,
  # e o plano não propõe rebaixar nada. Ignorar `engine_version` no lifecycle
  # resolveria o mesmo e criaria um ponto cego, onde o estado e a nuvem
  # divergem sem plano nenhum mostrar.
  lifecycle {
    prevent_destroy = true
  }
}

# Quem administra o banco precisa da senha, e a senha é um segredo gerido pelo
# RDS cifrado pela chave do domínio: sem `kms:Decrypt` junto, `GetSecretValue`
# devolve negação e o motivo não aparece no nome do erro.
#
# A política nasce aqui porque o segredo nasce aqui. Escrevê-la onde o acesso
# mora obrigaria aquela célula a aprender o ARN de um segredo que ela não
# produz, e a saber que ele existe.
data "aws_iam_policy_document" "administracao" {
  statement {
    sid       = "LerASenhaDoMestre"
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
    resources = [one(aws_db_instance.este.master_user_secret[*].secret_arn)]
  }

  statement {
    sid       = "DecifrarOSegredo"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [var.kms_key_arn]
  }

  # Onde o banco atende. Sem isto quem administra digita o endereço à mão, e
  # endereço digitado à mão é o que aponta para o banco errado.
  statement {
    sid       = "AcharOEndereco"
    effect    = "Allow"
    actions   = ["rds:DescribeDBInstances"]
    resources = [aws_db_instance.este.arn]
  }
}

resource "aws_iam_policy" "administracao" {
  name        = "administrar-${var.nome}"
  description = "a senha do mestre e o endereco deste banco"
  policy      = data.aws_iam_policy_document.administracao.json
}
