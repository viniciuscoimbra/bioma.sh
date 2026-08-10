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
  iam_role_arn = var.role_backup_arn
  plan_id      = aws_backup_plan.este.id

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "backup"
    value = "sim" # o recurso permanente carrega a tag de opt-in (artigo, ecossistema)
  }
}
