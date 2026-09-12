# O número de zonas da inspeção é decisão da célula, e o teto é três.
#
# A regra nasce com as três faces: a que PROÍBE (quatro zonas, zona repetida),
# a que LIBERA (uma zona, que é o caso de não-produção) e a que IDENTIFICA o
# alvo — aqui é o terceiro caso que separa portão de carimbo: com três zonas,
# que é o que produção declara, o organismo tem de produzir exatamente o que
# produzia quando o número estava escrito dentro dele. Sem esse caso, trocar
# `3` por `length(var.azs)` passa no teste e recria o firewall de produção.

mock_provider "aws" {}

variables {
  plano         = "tst"
  cidr_inspecao = "100.64.0.0/21"
  tgw_id        = "tgw-00000000000000000"
}

run "producao_segue_com_tres" {
  command = plan

  variables {
    azs = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
  }

  assert {
    condition     = length(aws_subnet.firewall) == 3 && length(aws_subnet.nat) == 3 && length(aws_subnet.tgw) == 3
    error_message = "com três zonas o organismo tem de manter as nove sub-redes de sempre."
  }

  assert {
    condition     = length(aws_nat_gateway.este) == 3 && length(aws_eip.nat) == 3
    error_message = "um NAT e um endereço por zona, como antes."
  }

  # Os índices são o que o Terraform usa para casar recurso com estado: se a
  # repartição da faixa mudasse, produção recriaria o que já está de pé. Os NOVE
  # blocos, e não uma amostra: conferir só o índice 0 de duas famílias deixa
  # passar a mudança nos outros sete, que é a que troca sub-rede, o
  # `subnet_mapping` do firewall e o NAT.
  assert {
    condition = alltrue([
      aws_subnet.firewall[0].cidr_block == "100.64.0.0/24",
      aws_subnet.firewall[1].cidr_block == "100.64.1.0/24",
      aws_subnet.firewall[2].cidr_block == "100.64.2.0/24",
      aws_subnet.nat[0].cidr_block == "100.64.3.0/24",
      aws_subnet.nat[1].cidr_block == "100.64.4.0/24",
      aws_subnet.nat[2].cidr_block == "100.64.5.0/24",
    ])
    error_message = "a repartição da faixa mudou, e mudar a faixa recria o firewall vivo."
  }

  # As do attachment moram nos dois blocos que sobram, e entram como /25. É o
  # trecho cuja prosa este organismo reescreveu quando o número de zonas virou
  # variável: sem este caso, mexer nela passa no teste.
  assert {
    condition = alltrue([
      aws_subnet.tgw[0].cidr_block == "100.64.6.0/25",
      aws_subnet.tgw[1].cidr_block == "100.64.6.128/25",
      aws_subnet.tgw[2].cidr_block == "100.64.7.0/25",
    ])
    error_message = "a repartição das sub-redes do attachment mudou, e recriá-las derruba a associação ao hub."
  }
}

run "nao_producao_paga_por_uma" {
  command = plan

  variables {
    azs = ["us-east-1a"]
  }

  assert {
    condition     = length(aws_subnet.firewall) == 1 && length(aws_nat_gateway.este) == 1
    error_message = "uma zona declarada é uma zona construída: é o que faz a conta cair a um terço."
  }

  # A zona única ocupa os mesmos blocos que ocuparia numa instalação de três:
  # acrescentar a segunda zona depois não mexe na primeira. Se a repartição
  # dependesse do TAMANHO da lista, e não do índice, crescer de uma para duas
  # recriaria a VPC inteira, e o plano diria isso tarde demais.
  assert {
    condition = alltrue([
      aws_subnet.firewall[0].cidr_block == "100.64.0.0/24",
      aws_subnet.nat[0].cidr_block == "100.64.3.0/24",
      aws_subnet.tgw[0].cidr_block == "100.64.6.0/25",
    ])
    error_message = "a zona única tem de nascer nos blocos 0, senão crescer para duas recria o que existe."
  }
}

run "quatro_zonas_nao_cabem" {
  command = plan

  variables {
    azs = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d"]
  }

  expect_failures = [var.azs]
}

run "zona_repetida_nao_vale" {
  command = plan

  variables {
    azs = ["us-east-1a", "us-east-1a"]
  }

  expect_failures = [var.azs]
}

run "lista_vazia_nao_vale" {
  command = plan

  variables {
    azs = []
  }

  expect_failures = [var.azs]
}
