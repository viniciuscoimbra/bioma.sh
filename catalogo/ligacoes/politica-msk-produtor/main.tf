# Ligação politica-msk-produtor (01.1 §6, lado de quem PRODUZ): a identity
# policy na role de uma carga que ESCREVE no barramento por IAM auth.
#
# Irmã de politica-msk-consumidor, e deliberadamente separada dela: aquela é
# cópia do framework (origem.json) e concede ReadData + grupo de consumo; um
# produtor precisa de WriteData no tópico e NÃO participa de consumer group.
# Misturar os dois numa receita só obrigaria editar a cópia de framework, que
# reprova verificar_ferramentas e teria de descer por sincronizar_framework.
# Esta é receita da INSTÂNCIA (nasce aqui, não vem do framework).
#
# kafka-cluster:Connect autoriza o handshake IAM no cluster; WriteData +
# DescribeTopic autorizam publicar no tópico do contrato. Sem grupo, sem
# ReadData: o produtor não lê nada e não coordena partição.

resource "aws_iam_role_policy" "produz" {
  name = "produz-msk-${var.sufixo}"
  role = var.role_name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["kafka:DescribeCluster", "kafka:DescribeClusterV2", "kafka:GetBootstrapBrokers"]
        Resource = var.cluster_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"]
        Resource = var.cluster_arn
      },
      {
        Effect   = "Allow"
        Action   = ["kafka-cluster:WriteData", "kafka-cluster:DescribeTopic"]
        Resource = var.topicos_arns
      },
    ]
  })
}
