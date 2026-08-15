output "nome" { value = aws_eks_cluster.este.name }
output "endpoint" { value = aws_eks_cluster.este.endpoint }
output "autoridade_certificadora" { value = aws_eks_cluster.este.certificate_authority[0].data }

output "emissor_oidc" { value = aws_eks_cluster.este.identity[0].oidc[0].issuer }
output "provedor_oidc_arn" { value = aws_iam_openid_connect_provider.eks.arn }

# O grupo de segurança que o próprio EKS mantém, preso às ENIs do plano de
# controle e às cargas gerenciadas. Não é o dos nós. Quem está fora do cluster e
# precisa aceitar tráfego dos pods referencia este, e o EKS gera um novo a cada
# recriação de cluster: por isso ele sai como saída, em vez de o identificador
# ser copiado à mão para a outra célula.
output "security_group_do_cluster_id" { value = aws_eks_cluster.este.vpc_config[0].cluster_security_group_id }
output "security_group_dos_nos_id" { value = aws_security_group.nos.id }

output "role_dos_nos_arn" { value = aws_iam_role.nos.arn }
output "role_balanceador_arn" { value = aws_iam_role.balanceador.arn }
output "role_karpenter_controlador_arn" { value = aws_iam_role.karpenter_controlador.arn }

# Nome, e não ARN: é assim que o EC2NodeClass do Karpenter nomeia o papel do nó.
output "role_karpenter_no_nome" { value = aws_iam_role.karpenter_no.name }
output "fila_karpenter_interrupcao_nome" { value = aws_sqs_queue.karpenter_interrupcao.name }

output "role_ebs_csi_arn" { value = aws_iam_role.ebs_csi.arn }
output "role_efs_csi_arn" { value = aws_iam_role.efs_csi.arn }
output "role_segredos_externos_arn" { value = aws_iam_role.segredos_externos.arn }

output "role_dns_externo_arn" {
  value       = try(aws_iam_role.dns_externo[0].arn, null)
  description = "nulo quando zona_dns_externo está vazia"
}

output "zona_dns_externo_id" {
  value       = try(aws_route53_zone.dns_externo[0].zone_id, null)
  description = "nulo quando zona_dns_externo está vazia"
}

output "zona_dns_externo_nome" {
  value       = try(aws_route53_zone.dns_externo[0].name, null)
  description = "nulo quando zona_dns_externo está vazia"
}
