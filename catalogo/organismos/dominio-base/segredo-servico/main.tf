# Organismo segredo-servico: só o cofre. O conteúdo (connection string,
# certificado de um fornecedor) nunca entra por esta receita — é aplicado fora, pelo
# time do serviço, via secret de pipeline do repositório do serviço
# (o repositório do serviço), nunca commitado em texto claro no catálogo.
#
# Mesmo espírito que um módulo de secrets-manager do repositório do serviço:
# secrets-manager já documentava no próprio README ("em ambientes reais, use
# state remoto criptografado e injete os valores via variáveis de pipeline"),
# só que aplicado de fato: aqui nem a variável de valor existe.
#
# O átomo mora aqui, e não na molécula `segredo`, porque este cofre é
# permanente e a molécula também serve o adapter efêmero da mesa —
# prevent_destroy é meta-argumento literal, não parametriza por variável.

resource "aws_secretsmanager_secret" "este" {
  name       = var.nome
  kms_key_id = var.kms_key_arn

  lifecycle { prevent_destroy = true } # contrato é permanente
}
