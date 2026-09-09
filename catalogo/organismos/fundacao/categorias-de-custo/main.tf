# Organismo categorias-de-custo (00): a planta do condomínio no Cost Explorer.
#
# Duas categorias, e elas são a única coisa que faz o Cost Explorer responder
# "quanto custa o MEU domínio" em vez de "quanto custou esta conta". `Dominio`
# diz de quem é cada conta; `Natureza` diz se aquilo é apartamento, medidor ou
# taxa. Sobre as duas, as regras de rateio distribuem o compartilhado.
#
# NASCEU DE IMPORT, e o motivo fica escrito porque explica o formato: as duas
# categorias existiam desde 01/08/2026 criadas fora do Terraform, e em 01/09
# foram trazidas para cá com `terragrunt import`. Categoria de custo é decisão
# de quem paga o quê, e decisão fora do versionamento é decisão que ninguém
# revisa e que o apply seguinte não sabe defender.

resource "aws_ce_cost_category" "dominio" {
  name          = "Dominio"
  rule_version  = "CostCategoryExpression.v1"
  default_value = var.valor_padrao

  dynamic "rule" {
    for_each = var.dominios
    content {
      value = rule.key

      # `REGULAR` e `match_options` declarados, e não deixados no default do
      # provider: as categorias entraram por import, e o que o provider omite
      # aparece no plano seguinte como mudança que ninguém pediu. Medido em
      # 01/09: sem estas duas linhas o plano propunha `type = "REGULAR" -> null`
      # em toda regra, o que é ruído sobre um recurso que descreve quem paga o
      # quê.
      type = "REGULAR"

      rule {
        dimension {
          key           = "LINKED_ACCOUNT"
          values        = rule.value
          match_options = ["EQUALS"]
        }
      }
    }
  }

  # O rateio, que é o que separa um extrato de um relatório de contabilidade.
  #
  # Sem estas regras o Cost Explorer mostra o core bancário com o custo DIRETO
  # dele e deixa a rede, o barramento e o lake que ele consome contabilizados
  # como plataforma. Medido em 01/09: US$ 6.383 na tela contra US$ 11.743 de
  # custo real. O executivo que aprova o orçamento via pouco mais da metade da
  # conta dele.
  #
  # PROPORTIONAL é a régua da fração ideal do condomínio: cada domínio de
  # negócio recebe a fatia da plataforma na proporção do que ele já gasta
  # direto. A alternativa EVEN (partes iguais) fica registrada como possível, e
  # é o que faz sentido antes de qualquer domínio ter carga.
  #
  # O destino NÃO inclui `sandbox` de propósito: sandbox é lugar de experimento,
  # não domínio de negócio, e cobrar dele quota de plataforma faria o
  # experimento parecer caro por uma razão que não é dele.
  dynamic "split_charge_rule" {
    for_each = var.rateia_para_dominios
    content {
      source  = split_charge_rule.value
      targets = var.dominios_de_negocio
      method  = var.metodo_de_rateio
    }
  }
}

# O terceiro eixo: em QUE AMBIENTE o custo aconteceu.
#
# Existe porque a pergunta que o dono do domínio faz não é só "quanto custa o
# meu", é "quanto do meu é produção". Com `Dominio` e `Ambiente` no mesmo
# painel, o Cost Explorer responde as duas de uma vez, e o corte que hoje sai
# de somar contas à mão passa a ser um filtro.
#
# `unico` não é ausência de ambiente, é a resposta certa para quem não tem:
# a rede é uma só, e as contas de governança também. Deixá-las fora faria a
# soma dos ambientes não fechar com a fatura, que é o teste de qualquer eixo.
resource "aws_ce_cost_category" "ambiente" {
  name          = "Ambiente"
  rule_version  = "CostCategoryExpression.v1"
  default_value = var.valor_padrao

  dynamic "rule" {
    for_each = var.ambientes
    content {
      value = rule.key
      type  = "REGULAR"

      rule {
        dimension {
          key           = "LINKED_ACCOUNT"
          values        = rule.value
          match_options = ["EQUALS"]
        }
      }
    }
  }
}

resource "aws_ce_cost_category" "natureza" {
  name          = "Natureza"
  rule_version  = "CostCategoryExpression.v1"
  default_value = var.valor_padrao

  dynamic "rule" {
    for_each = var.naturezas
    content {
      value = rule.key

      # `REGULAR` e `match_options` declarados, e não deixados no default do
      # provider: as categorias entraram por import, e o que o provider omite
      # aparece no plano seguinte como mudança que ninguém pediu. Medido em
      # 01/09: sem estas duas linhas o plano propunha `type = "REGULAR" -> null`
      # em toda regra, o que é ruído sobre um recurso que descreve quem paga o
      # quê.
      type = "REGULAR"

      rule {
        dimension {
          key           = "LINKED_ACCOUNT"
          values        = rule.value
          match_options = ["EQUALS"]
        }
      }
    }
  }
}

# A permissão de VER o painel de custo, que nenhuma política da AWS concede.
#
# `job-function/Billing` tem 153 ações e nenhuma de `bcm-dashboards`: o serviço
# de painéis de billing é novo e as políticas gerenciadas ainda não o alcançam.
# O efeito é o pior tipo de falha de acesso — quem entra com o conjunto de
# FinOps abre o console, tem todo o Cost Explorer, e a lista de painéis chega
# VAZIA, sem erro nenhum que explique.
#
# Medido em 03/09, com o dono da plataforma abrindo o link antes de uma reunião.
#
# Só leitura: quem cria e altera painel é a esteira, pela ferramenta
# `painel_finops.py`. Dar escrita aqui abriria a porta para o painel virar
# coisa de console, e painel de console não é diff.
# A permissão de LIGAR e operar o FinOps Agent, que a AWS pôs em preview.
#
# O agente lê custo em linguagem natural e sugere otimização. Ele NÃO substitui
# as categorias, o rateio e os orçamentos: aqueles respondem de forma
# determinística e reproduzível, e esta é uma segunda porta para os mesmos
# dados. Ligar não muda nenhum número; muda quem consegue perguntar.
#
# POR QUE SÓ A POLÍTICA MORA AQUI. O serviço não existe no provider Terraform
# nem na CLI da AWS: conferido em 03/09, o provider não tem recurso `finops` e
# os dados da CLI trazem os quatro `bcm-*` e nenhum `finops-agent`. Criar o
# agente é passo de console, e o assistente de criação cria as roles de serviço
# dele por conta própria — deixar que ele as crie é deliberado, porque
# duplicá-las aqui seria duas fontes escrevendo a mesma coisa.
#
# O que esta política faz é o mínimo para aquele assistente poder rodar: as
# ações do serviço, a leitura de IAM que o seletor de papel usa, e a criação de
# papel RESTRITA ao prefixo que o próprio agente usa. Sem o recorte do prefixo,
# `iam:CreateRole` seria a chave da casa.
resource "aws_iam_policy" "operar_agente_finops" {
  count = var.habilitar_agente_finops ? 1 : 0

  name        = var.nome_da_politica_do_agente
  path        = "/"
  description = "Ligar e operar o AWS FinOps Agent, que nao existe no provider nem na CLI"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "OperarOAgente"
        Effect = "Allow"
        Action = [
          "finops-agent:Create*",
          "finops-agent:Get*",
          "finops-agent:List*",
          "finops-agent:Update*",
          "finops-agent:Delete*",
        ]
        Resource = "*"
      },
      {
        # O seletor de papel do assistente lista papéis para escolher qual o
        # agente assume. Leitura, e nada além.
        Sid      = "LerIamParaOSeletor"
        Effect   = "Allow"
        Action   = ["iam:GetRole", "iam:ListRoles"]
        Resource = "*"
      },
      {
        # Criar papel, e SÓ o do agente. O prefixo é o recorte que separa
        # "deixar o assistente trabalhar" de "poder criar qualquer identidade".
        Sid    = "CriarSoOsPapeisDoAgente"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:AttachRolePolicy",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
        ]
        Resource = [
          "arn:aws:iam::*:role/service-role/AWSFinOpsAgent*",
          "arn:aws:iam::*:role/AWSFinOpsAgent*",
        ]
      },
      {
        # O papel de serviço precisa de um caminho para nascer, e a AWS o cria
        # com este principal. Sem isto o assistente falha na última tela.
        Sid      = "DeixarOServicoAssumir"
        Effect   = "Allow"
        Action   = "iam:CreateServiceLinkedRole"
        Resource = "*"
        Condition = {
          StringEquals = {
            "iam:AWSServiceName" = "finops-agent.amazonaws.com"
          }
        }
      },
    ]
  })
}

resource "aws_iam_policy" "ver_paineis" {
  name        = var.nome_da_politica_de_paineis
  path        = "/"
  description = "Ler os paineis de billing, que a policy Billing da AWS nao cobre"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      # CURINGA DE LEITURA, e não lista de ações, porque enumerar falhou duas
      # vezes no mesmo dia. A primeira lista tinha três ações e o console pediu
      # `ListScheduledReports`; a segunda teria pedido a próxima. Console de
      # billing chama dezenas de operações por tela, e a lista que eu escrevo
      # é sempre a de ontem.
      #
      # `Get*`, `List*` e `Describe*` cobrem toda a leitura dos dois serviços e
      # nenhuma escrita: criar, alterar e apagar painel continuam fora, e quem
      # os faz é a esteira pela ferramenta painel_finops.py.
      #
      # As de `ce:` entram aqui porque a própria política gerenciada da AWS não
      # as tem: `job-function/Billing` não concede ce:DescribeReport,
      # ce:GetCostForecast, ce:GetAnomalies nem outras doze, medidas em 03/09.
      # Relatório vazio no console quase sempre é uma dessas negada em silêncio.
      Action = [
        "bcm-dashboards:Get*",
        "bcm-dashboards:List*",
        "bcm-dashboards:Describe*",
        "ce:Get*",
        "ce:List*",
        "ce:Describe*",
      ]
      Resource = "*"
    }]
  })
}

