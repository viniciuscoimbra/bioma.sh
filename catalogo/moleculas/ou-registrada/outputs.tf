output "ou_id" { value = aws_organizations_organizational_unit.esta.id }
output "ou_arn" { value = aws_organizations_organizational_unit.esta.arn }

# Quem lê precisa saber se esta OU está governada, e não só se ela existe. A
# resposta vira insumo do relatório de cobertura e da conferência de fim de fase.
output "registrada" {
  value       = var.registrar && var.baseline_identifier != null
  description = "false quando a OU nasceu antes de a landing zone publicar o baseline"
}

output "por_que_nao_registrada" {
  value = (var.registrar && var.baseline_identifier == null
    ? "a landing zone ainda não publicou o identificador do baseline; registre esta OU depois da fase 01"
  : var.registrar ? "" : "esta OU não recebe o baseline geral, por decisão")
}
