# O que a política gera por entrada de leitor e escritor, sem nuvem: o provider
# é simulado, e cada caso lê o JSON do plano. Os casos de recusa importam tanto
# quanto o de sucesso, porque Sid repetido ou statement sem recurso só
# apareceria no PutClusterPolicy, depois do plano verde.
#
#   terraform init -backend=false && terraform test

mock_provider "aws" {}

variables {
  cluster_arn         = "arn:aws:kafka:us-east-1:111111111111:cluster/barramento-exemplo/aaaa-14"
  contas_consumidoras = ["arn:aws:iam::222222222222:root"]
}

run "entradas_com_curinga_reproduzem_o_escopo_total" {
  command = plan
  variables {
    leitores = {
      LeitoresDeFora = {
        principais = ["arn:aws:iam::333333333333:role/le-a", "arn:aws:iam::333333333333:role/le-b"]
        topicos    = ["*"]
        grupos     = ["*"]
      }
    }
    escritores = {
      EscritoresDeFora = {
        principais = ["arn:aws:iam::333333333333:role/escreve-a"]
        topicos    = ["*"]
      }
    }
  }
  assert {
    condition = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Sid] == [
      "ConsumidoresAutorizados",
      "LeitoresDeForaConectam", "LeitoresDeForaLeem", "LeitoresDeForaCoordenam",
      "EscritoresDeForaConectam", "EscritoresDeForaEscrevem",
    ]
    error_message = "Sids fora do esperado"
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Resource if s.Sid == "LeitoresDeForaLeem"][0] == ["arn:aws:kafka:us-east-1:111111111111:topic/barramento-exemplo/*/*"]
    error_message = "recurso de tópico fora do esperado"
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Resource if s.Sid == "LeitoresDeForaCoordenam"][0] == ["arn:aws:kafka:us-east-1:111111111111:group/barramento-exemplo/*/*"]
    error_message = "recurso de grupo fora do esperado"
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Action if s.Sid == "LeitoresDeForaConectam"][0] == ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster"]
    error_message = "leitor não pode conectar com escrita idempotente"
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Action if s.Sid == "EscritoresDeForaConectam"][0] == ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster", "kafka-cluster:WriteDataIdempotently"]
    error_message = "escritor precisa da escrita idempotente no cluster"
  }
}

run "leitor_sem_grupo_nao_gera_coordenacao" {
  command = plan
  variables {
    leitores = { Leitor = { principais = ["arn:aws:iam::333333333333:role/x"], topicos = ["t.v1"] } }
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Sid] == ["ConsumidoresAutorizados", "LeitorConectam", "LeitorLeem"]
    error_message = "leitor sem grupo gerou coordenação"
  }
}

run "sem_entradas_a_politica_fica_como_era" {
  command = plan
  variables {
    conectores_arns        = ["arn:aws:iam::444444444444:role/conector"]
    topicos_dos_conectores = ["t.v1"]
    grupos_dos_conectores  = ["connect-*"]
  }
  assert {
    condition     = length(jsondecode(aws_msk_cluster_policy.esta.policy).Statement) == 5
    error_message = "sem leitores e escritores a política mudou de tamanho"
  }
  # A ORDEM, e não só a conta: o bloco dos conectores é um `concat` desde que a
  # coordenação virou condicional, e concat que monte na ordem trocada reescreve
  # o JSON das células que já aplicaram sem mudar uma permissão sequer.
  assert {
    condition = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Sid] == [
      "ConsumidoresAutorizados",
      "ConectoresDeOutraContaConectam", "ConectoresDeOutraContaLeem",
      "ConectoresDeOutraContaCoordenam", "ConectoresDeOutraContaTransacionam",
    ]
    error_message = "a ordem dos statements dos conectores mudou"
  }
}

# As listas antigas separam principal de recurso em duas variáveis. Os quatro
# casos abaixo são o contrato delas: principal sem recurso é recusa, grupo sem
# recurso é omissão, e lista vazia dos DOIS lados não é nem uma nem outra.

run "contas_consumidoras_vazia_e_recusada" {
  command = plan
  variables {
    contas_consumidoras = []
  }
  expect_failures = [var.contas_consumidoras]
}

run "conector_sem_topico_e_recusado" {
  command = plan
  variables {
    conectores_arns        = ["arn:aws:iam::444444444444:role/conector"]
    topicos_dos_conectores = []
    grupos_dos_conectores  = ["connect-*"]
  }
  expect_failures = [aws_msk_cluster_policy.esta]
}

run "produtor_sem_topico_e_recusado" {
  command = plan
  variables {
    produtores_arns        = ["arn:aws:iam::444444444444:role/produtor"]
    topicos_dos_produtores = []
  }
  expect_failures = [aws_msk_cluster_policy.esta]
}

# O contra-caso que separa o portão do carimbo: a lista de tópicos vazia só é
# defeito quando existe principal para ela. Sem conector e sem produtor o bloco
# inteiro já não nasce, e uma recusa aqui expulsaria a instalação que não tem
# nenhum dos dois.
run "topicos_vazios_sem_principal_nao_reprovam" {
  command = plan
  variables {
    conectores_arns        = []
    topicos_dos_conectores = []
    produtores_arns        = []
    topicos_dos_produtores = []
  }
  assert {
    condition     = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Sid] == ["ConsumidoresAutorizados"]
    error_message = "sem conector e sem produtor a política devia ter só o statement de consumidor"
  }
}

run "conector_sem_grupo_nao_gera_coordenacao" {
  command = plan
  variables {
    conectores_arns        = ["arn:aws:iam::444444444444:role/conector"]
    topicos_dos_conectores = ["t.v1"]
    grupos_dos_conectores  = []
  }
  assert {
    condition = [for s in jsondecode(aws_msk_cluster_policy.esta.policy).Statement : s.Sid] == [
      "ConsumidoresAutorizados",
      "ConectoresDeOutraContaConectam", "ConectoresDeOutraContaLeem",
      "ConectoresDeOutraContaTransacionam",
    ]
    error_message = "conector sem grupo gerou coordenação, ou a omissão levou outro statement junto"
  }
}

run "mesmo_nome_nos_dois_mapas_e_recusado" {
  command = plan
  variables {
    leitores   = { Igual = { principais = ["arn:aws:iam::333333333333:role/x"], topicos = ["t"] } }
    escritores = { Igual = { principais = ["arn:aws:iam::333333333333:role/y"], topicos = ["t"] } }
  }
  expect_failures = [aws_msk_cluster_policy.esta]
}

run "nome_com_hifen_e_recusado" {
  command = plan
  variables {
    leitores = { "com-hifen" = { principais = ["arn:aws:iam::333333333333:role/x"], topicos = ["t"] } }
  }
  expect_failures = [var.leitores]
}

run "prefixo_da_receita_e_recusado" {
  command = plan
  variables {
    escritores = { ProdutoresDeOutraConta = { principais = ["arn:aws:iam::333333333333:role/x"], topicos = ["t"] } }
  }
  expect_failures = [var.escritores]
}

run "entrada_sem_topico_e_recusada" {
  command = plan
  variables {
    escritores = { Vazio = { principais = ["arn:aws:iam::333333333333:role/x"], topicos = [] } }
  }
  expect_failures = [var.escritores]
}
