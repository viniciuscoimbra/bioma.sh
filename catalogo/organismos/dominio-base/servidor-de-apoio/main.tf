# Organismo servidor-de-apoio: o servidor que o domínio precisa manter em EC2
# porque o software não roda em contêiner. É o caso do produto de fornecedor com
# licença presa à máquina, do diretório LDAP e do gerenciador de fila de
# mensagem. Nasce a instância, o grupo de segurança que é a fronteira dela, o
# par de chave, o volume de dados e o perfil que deixa o agente do SSM registrar
# a máquina.
#
# Não nasce a rede: VPC, sub-rede e roteamento são do organismo vpc-dominio e
# chegam por input. Não nasce a imagem: a AMI é escolha da instituição e entra
# por variável. Não nasce o que roda dentro: instalação e configuração do
# fornecedor são de quem opera o produto.
#
# Que servidores existem é dado da célula, no mapa `servidores`. O papel de cada
# um é o batismo da chave, e o catálogo não conhece a lista.
#
# O grupo de segurança mora aqui e não em receita própria: fronteira é parte do
# que ela protege, e grupo solto era o que fazia a instalação nascer com a porta
# aberta no console e nenhuma linha em Git dizendo para quem.
#
# Durabilidade permanente. Apagar e recriar pela receita devolve máquina limpa,
# e o que o fornecedor gravou não volta igual. A premissa que sustenta a trava:
# conteúdo que precisa sobreviver mora em volume de dados, que nasce aqui como
# átomo próprio e travado; o disco raiz é software, e ele volta da imagem mais a
# instalação. Servidor cujo estado esteja no disco raiz não cumpre a premissa
# desta receita.

locals {
  nome_base = "${var.dominio}-${var.ambiente}"

  # Uma regra por origem, e não uma regra com lista de origens: o
  # aws_vpc_security_group_ingress_rule aceita uma origem só. A chave nomeia
  # servidor, protocolo, porta e origem, sem índice de lista, porque reordenar
  # `entradas` na célula destruiria e recriaria regra que não mudou.
  regras_de_entrada = flatten([
    for servidor, s in var.servidores : [
      for e in s.entradas : concat(
        [for c in e.cidrs : {
          servidor        = servidor
          origem          = c
          cidr            = c
          servidor_origem = null
          grupo_id        = null
          protocolo       = e.protocolo
          porta_inicial   = e.porta_inicial
          porta_final     = e.porta_final
          descricao       = e.descricao
        }],
        [for o in e.origens_servidor : {
          servidor        = servidor
          origem          = "servidor:${o}"
          cidr            = null
          servidor_origem = o
          grupo_id        = null
          protocolo       = e.protocolo
          porta_inicial   = e.porta_inicial
          porta_final     = e.porta_final
          descricao       = e.descricao
        }],
        [for g in e.origens_grupo_id : {
          servidor        = servidor
          origem          = "grupo:${g}"
          cidr            = null
          servidor_origem = null
          grupo_id        = g
          protocolo       = e.protocolo
          porta_inicial   = e.porta_inicial
          porta_final     = e.porta_final
          descricao       = e.descricao
        }],
      )
    ]
  ])

  entradas = {
    for r in local.regras_de_entrada :
    "${r.servidor}:${r.protocolo}:${r.porta_inicial == null ? "todas" : r.porta_inicial}:${r.origem}" => r
  }

  volumes_dados = {
    for v in flatten([
      for servidor, s in var.servidores : [
        for v in s.volumes_dados : merge(v, { servidor = servidor })
      ]
    ]) : "${v.servidor}:${v.dispositivo}" => v
  }
}

# ---------------------------------------------------------------------------
# Pares de chave
# ---------------------------------------------------------------------------
# Entra o conteúdo da metade pública, nunca o caminho de um arquivo. Caminho de
# arquivo amarra a receita ao repositório que a chamou: quem aplica de outro
# lugar recebe "no file exists", e a chave que deveria ser dado da instalação
# vira anexo do código.
resource "aws_key_pair" "esta" {
  for_each = var.chaves_publicas

  key_name   = each.key
  public_key = each.value

  tags = { Name = each.key }
}

# ---------------------------------------------------------------------------
# Perfil de instância do SSM
# ---------------------------------------------------------------------------
# É o que permite o agente registrar a máquina (sessão, área de trabalho remota
# pelo Fleet Manager, correção de segurança). Servidor administrado só por SSM
# sobe inalcançável sem ele, e é a alternativa a abrir porta de administração na
# fronteira.
resource "aws_iam_role" "ssm" {
  count = var.criar_perfil_ssm ? 1 : 0

  name = "${local.nome_base}-apoio-ssm"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  count = var.criar_perfil_ssm ? 1 : 0

  role       = aws_iam_role.ssm[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Onde a conta grava a sessão, quem grava é esta máquina, e a permissão do
# destino nasce com o destino. A lista é vazia por default porque conta sem
# gravação obrigatória não tem destino nenhum.
resource "aws_iam_role_policy_attachment" "declarada" {
  for_each = var.criar_perfil_ssm ? toset(var.politicas_gerenciadas) : toset([])

  role       = aws_iam_role.ssm[0].name
  policy_arn = each.value
}

resource "aws_iam_role_policy" "ssm_kms" {
  count = var.criar_perfil_ssm && var.kms_sessao_ssm_arn != null ? 1 : 0

  name = "sessao-kms"
  role = aws_iam_role.ssm[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
      Resource = var.kms_sessao_ssm_arn
    }]
  })
}

resource "aws_iam_instance_profile" "ssm" {
  count = var.criar_perfil_ssm ? 1 : 0

  name = "${local.nome_base}-apoio-ssm"
  role = aws_iam_role.ssm[0].name
}

# ---------------------------------------------------------------------------
# Fronteira
# ---------------------------------------------------------------------------
resource "aws_security_group" "servidor" {
  for_each = var.servidores

  name        = "${local.nome_base}-${each.key}"
  description = "Fronteira do servidor de apoio ${each.key} (${local.nome_base})"
  vpc_id      = var.vpc_id

  tags = { Name = "${local.nome_base}-${each.key}" }
}

resource "aws_vpc_security_group_ingress_rule" "servidor" {
  for_each = local.entradas

  security_group_id = aws_security_group.servidor[each.value.servidor].id

  ip_protocol = each.value.protocolo

  # Faixa ausente fecha na porta inicial. No protocolo "-1" as duas são nulas, e
  # a variável cobra isso: a API recusa faixa quando o protocolo já é todos.
  from_port = each.value.porta_inicial
  to_port   = each.value.porta_inicial == null ? null : coalesce(each.value.porta_final, each.value.porta_inicial)

  cidr_ipv4 = each.value.cidr

  # `servidor_origem` aponta outro grupo deste organismo, `grupo_id` um que
  # nasceu fora. O `try` escolhe o que está preenchido: indexar o mapa com chave
  # nula é justamente a falha que ele engole.
  referenced_security_group_id = try(
    aws_security_group.servidor[each.value.servidor_origem].id,
    each.value.grupo_id,
  )

  description = each.value.descricao

  tags = { Name = each.key }
}

# Saída aberta: o caminho para fora já é decidido pela rota e pela inspeção de
# egress do domínio, e fechar aqui de novo só esconde onde a decisão mora. É por
# ele que a máquina alcança os endpoints do SSM e as atualizações do sistema.
resource "aws_vpc_security_group_egress_rule" "servidor" {
  for_each = var.servidores

  security_group_id = aws_security_group.servidor[each.key].id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "saida pela rota e pela inspecao de egress"
}

# ---------------------------------------------------------------------------
# As máquinas
# ---------------------------------------------------------------------------
resource "aws_instance" "este" {
  for_each = var.servidores

  ami           = each.value.ami
  instance_type = each.value.tipo

  subnet_id  = var.subnet_ids[each.value.subnet_index]
  private_ip = each.value.ip_privado

  vpc_security_group_ids = [aws_security_group.servidor[each.key].id]

  # Mesmo `try` do bloco de entrada: o par de chave pode nascer aqui ou já
  # existir na conta, e no segundo caso o mapa não tem a chave.
  key_name = try(aws_key_pair.esta[each.value.chave].key_name, each.value.chave)

  # O perfil nomeado na célula vence o que esta receita cria; sem nenhum dos
  # dois a máquina sobe sem SSM, e alcançá-la passa a depender de porta aberta.
  iam_instance_profile = each.value.perfil_instancia != null ? each.value.perfil_instancia : try(aws_iam_instance_profile.ssm[0].name, null)

  ebs_optimized = each.value.ebs_otimizado
  monitoring    = each.value.monitoramento_detalhado

  # Família burstable roda em modo unlimited. Deixar implícito faz o provider
  # voltar para "standard" no apply seguinte e limitar a CPU em silêncio sob
  # carga sustentada, que é o pior modo de um servidor de apoio degradar.
  dynamic "credit_specification" {
    for_each = startswith(each.value.tipo, "t") ? [1] : []

    content {
      cpu_credits = "unlimited"
    }
  }

  # O arranjo de CPU, quando a carga é licenciada por núcleo. Bloco dinâmico e
  # não atributo fixo porque declarar `cpu_options` com o arranjo padrão do
  # tipo não é o mesmo que não declarar: o atributo presente entra no diff de
  # toda máquina, e uma que hoje não pede nada passaria a ser substituída para
  # receber o que já tinha.
  dynamic "cpu_options" {
    for_each = each.value.nucleos != null || each.value.fios_por_nucleo != null ? [1] : []

    content {
      core_count       = each.value.nucleos
      threads_per_core = each.value.fios_por_nucleo
    }
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2 obrigatório
    http_put_response_hop_limit = 2
  }

  root_block_device {
    volume_size = each.value.disco_raiz.tamanho_gb
    volume_type = each.value.disco_raiz.tipo
    encrypted   = true
    kms_key_id  = var.kms_key_arn

    # O disco raiz é software, e some com a máquina de propósito. O que precisa
    # sobreviver está nos volumes de dados abaixo, que são átomos próprios.
    delete_on_termination = true
  }

  tags = merge(
    each.value.etiquetas,
    { Name = "${local.nome_base}-${each.key}" },
  )
}

# Volume de dados como átomo próprio, e não como `ebs_block_device` dentro da
# instância. Bloco embutido não carrega lifecycle: ele morre com a máquina, e a
# trava desta receita não teria onde morar. Separado, trocar a AMI recria a
# instância e o disco continua onde estava.
resource "aws_ebs_volume" "dados" {
  for_each = local.volumes_dados

  # A zona vem da instância, e não de um input próprio: volume e máquina só se
  # ligam dentro da mesma zona, e um input separado permitiria declarar as duas
  # em zonas diferentes, com o erro aparecendo no apply. A consequência é que
  # mover `subnet_index` para outra zona esbarra na trava, e é o comportamento
  # certo: servidor com estado não muda de zona sem instantâneo.
  availability_zone = aws_instance.este[each.value.servidor].availability_zone

  size       = each.value.tamanho_gb
  type       = each.value.tipo
  encrypted  = true
  kms_key_id = var.kms_key_arn

  tags = { Name = "${local.nome_base}-${each.value.servidor}-${replace(trimprefix(each.value.dispositivo, "/"), "/", "-")}" }

  lifecycle { prevent_destroy = true }
}

resource "aws_volume_attachment" "dados" {
  for_each = local.volumes_dados

  device_name = each.value.dispositivo
  volume_id   = aws_ebs_volume.dados[each.key].id
  instance_id = aws_instance.este[each.value.servidor].id
}
