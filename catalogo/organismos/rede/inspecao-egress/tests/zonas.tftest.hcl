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
  # repartição da faixa mudasse, produção recriaria o que já está de pé.
  assert {
    condition     = aws_subnet.firewall[0].cidr_block == "100.64.0.0/24" && aws_subnet.nat[0].cidr_block == "100.64.3.0/24"
    error_message = "a repartição da faixa mudou, e mudar a faixa recria o firewall vivo."
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

  # A primeira zona ocupa os mesmos blocos que ocuparia numa instalação de
  # três: acrescentar a segunda zona depois não mexe na primeira.
  assert {
    condition     = aws_subnet.firewall[0].cidr_block == "100.64.0.0/24"
    error_message = "a zona única tem de nascer no bloco 0, senão crescer para duas recria a que existe."
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
