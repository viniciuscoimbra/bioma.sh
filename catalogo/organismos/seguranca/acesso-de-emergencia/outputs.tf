output "grupo" {
  description = "o grupo que se preenche na emergência e se esvazia depois"
  value       = aws_identitystore_group.emergencia.display_name
}

output "grupo_id" { value = aws_identitystore_group.emergencia.group_id }

output "permission_set_arn" { value = aws_ssoadmin_permission_set.emergencia.arn }

output "topico_aviso_arn" { value = module.aviso.arn }
