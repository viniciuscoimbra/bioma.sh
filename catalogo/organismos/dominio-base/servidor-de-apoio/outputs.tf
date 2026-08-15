output "ids" {
  description = "id da instância, por nome lógico"
  value       = { for k, i in aws_instance.este : k => i.id }
}

output "ips_privados" {
  description = "endereço privado por nome lógico; é o que a regra de firewall de fora e a configuração da aplicação apontam"
  value       = { for k, i in aws_instance.este : k => i.private_ip }
}

output "dns_privados" {
  description = "nome DNS privado por nome lógico"
  value       = { for k, i in aws_instance.este : k => i.private_dns }
}

output "grupos_de_seguranca" {
  description = "id do grupo de segurança por nome lógico; é o sítio por onde outra receita declara que fala com este servidor"
  value       = { for k, g in aws_security_group.servidor : k => g.id }
}

output "volumes_dados" {
  description = "id do volume de dados por \"<servidor>:<dispositivo>\"; é o que um instantâneo aponta antes de trocar a imagem"
  value       = { for k, v in aws_ebs_volume.dados : k => v.id }
}

output "perfil_ssm" {
  description = "perfil de instância criado aqui, ou nulo quando a instalação usa um perfil próprio"
  value       = try(aws_iam_instance_profile.ssm[0].name, null)
}
