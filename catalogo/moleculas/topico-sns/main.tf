# Molécula topico-sns: um assunto de notificação, com a cifra e as assinaturas
# dele. Um tópico por receita, como o cofre em `segredo` e o assunto em
# `topico-kafka`.
#
# Não nasce o outro lado da entrega. A fila que recebe é de quem a possui, e é a
# política DELA que autoriza `sns.amazonaws.com` a escrever; declarar aqui só
# essa metade produz assinatura que nunca entrega. Não nasce a permissão de
# publicar: permissão entre dois donos é ligação, e ligação declara os dois
# lados.
#
# Durabilidade renovável. O tópico não guarda conteúdo: o ARN é derivado de
# conta, região e nome, então apagar e recriar pela receita devolve o mesmo
# endereço, com as mesmas assinaturas. O que estava em trânsito é reenvio do
# produtor. Por isso não há trava aqui. A ressalva é a assinatura por e-mail: a
# confirmação é clique de gente, e o tópico recriado volta com ela pendente
# enquanto o Terraform relata sucesso.

resource "aws_sns_topic" "este" {
  # O FIFO exige o sufixo ".fifo" ou a API recusa o nome. A receita o acrescenta
  # para a célula não ter que saber disso, e não duplica quando já veio escrito.
  name = var.fifo && !endswith(var.nome, ".fifo") ? "${var.nome}.fifo" : var.nome

  display_name = var.nome_exibido

  fifo_topic = var.fifo

  # Só o FIFO conhece deduplicação; no tópico comum o campo precisa sair, e não
  # ir como falso.
  content_based_deduplication = var.fifo ? var.deduplicacao_por_conteudo : null

  kms_master_key_id = var.kms_key_arn
}

# Sem política declarada o tópico fica com a padrão da AWS, que dá controle ao
# dono da conta. A política escrita SUBSTITUI aquela: quem declara uma para
# liberar publicador de fora precisa repetir o controle do dono dentro dela, ou
# console e linha de comando perdem o tópico.
resource "aws_sns_topic_policy" "esta" {
  count = var.policy_json == null ? 0 : 1

  arn    = aws_sns_topic.este.arn
  policy = var.policy_json
}

# A chave é protocolo mais destino, e não a posição na lista: reordenar
# `assinaturas` na célula destruiria e recriaria assinatura que não mudou, e uma
# assinatura de e-mail recriada volta a pedir confirmação.
resource "aws_sns_topic_subscription" "assinatura" {
  for_each = { for a in var.assinaturas : "${a.protocolo}:${a.destino}" => a }

  topic_arn = aws_sns_topic.este.arn
  protocol  = each.value.protocolo
  endpoint  = each.value.destino

  raw_message_delivery = each.value.mensagem_crua
  filter_policy        = each.value.filtro_json
  filter_policy_scope  = each.value.filtro_escopo
}
