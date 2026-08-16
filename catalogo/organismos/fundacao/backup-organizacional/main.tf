# Organismo backup-organizacional (00·D3): cofre na residência e cofre na
# região secundária. O AWS Backup cifra cada cópia com a chave do vault de
# DESTINO, então o cofre secundário usa a réplica multi-region da chave: é ela
# que mantém a cópia legível quando a primária está indisponível. Recurso sem
# criptografia independente (Aurora, RDS) exige customer-managed key no destino.

resource "aws_backup_vault" "primario" {
  name        = "${var.nome}-primario"
  kms_key_arn = var.kms_primaria_arn

  lifecycle { prevent_destroy = true } # o vault guarda ponto de recuperação: não volta por receita
}

resource "aws_backup_vault_lock_configuration" "primario" {
  backup_vault_name  = aws_backup_vault.primario.name
  min_retention_days = var.retencao_minima_dias
}

resource "aws_backup_vault" "secundario" {
  provider = aws.secundaria

  name        = "${var.nome}-secundario"
  kms_key_arn = var.kms_replica_arn # a réplica multi-region, ARN e policy próprios

  lifecycle { prevent_destroy = true } # o vault guarda ponto de recuperação: não volta por receita
}

resource "aws_backup_vault_lock_configuration" "secundario" {
  provider = aws.secundaria

  backup_vault_name  = aws_backup_vault.secundario.name
  min_retention_days = var.retencao_minima_dias
}

resource "aws_backup_plan" "este" {
  name = var.nome

  rule {
    rule_name         = "diario-com-copia-cross-region"
    target_vault_name = aws_backup_vault.primario.name
    schedule          = var.agenda_cron

    lifecycle { delete_after = var.retencao_dias }

    copy_action {
      destination_vault_arn = aws_backup_vault.secundario.arn
      lifecycle { delete_after = var.retencao_dias }
    }
  }
}

resource "aws_backup_selection" "por_tag" {
  name         = "${var.nome}-por-tag"
  iam_role_arn = local.papel_do_backup
  plan_id      = aws_backup_plan.este.id

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "sim" # o recurso permanente carrega a tag de opt-in (artigo, ecossistema)
  }
}

# A role que o serviço de backup assume para ler o recurso e escrever no cofre.
# Ela nasce aqui quando a instituição não informa uma: nenhuma peça da árvore a
# produzia, e a célula do backup pedia o ARN de algo que não existia em lugar
# nenhum. Informar o ARN continua valendo para quem já tem a sua.
resource "aws_iam_role" "backup" {
  count = var.role_backup_arn == null ? 1 : 0

  name = "${var.nome}-backup"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# As duas políticas gerenciadas do serviço, e não uma política escrita à mão: a
# lista de ações que o backup precisa muda a cada serviço novo que ele passa a
# cobrir, e política própria envelhece calada, falhando só no recurso novo.
resource "aws_iam_role_policy_attachment" "backup" {
  for_each = var.role_backup_arn == null ? toset([
    "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup",
    "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores",
  ]) : toset([])

  role       = aws_iam_role.backup[0].name
  policy_arn = each.value
}

locals {
  papel_do_backup = var.role_backup_arn != null ? var.role_backup_arn : aws_iam_role.backup[0].arn
}
