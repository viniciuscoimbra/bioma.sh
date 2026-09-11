# Tasks: acesso de fora ao barramento

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

> Esta change foi escrita depois do código, em 2026-09-11, quando a revisão
> cruzada cobrou a falta. O combinado é a ordem inversa, e o precedente dos
> commits de catálogo anteriores, que também não têm change, não a dispensa.

## 1. A política aceita escopo por principal

- [x] **1.1 `leitores` e `escritores` na receita.** Mapas em que a entrada junta principais, tópicos e, no leitor, grupos; os statements saem do escopo da entrada. _Evidência: 550d0b0, `catalogo/ligacoes/politica-msk-cluster/variables.tf` (+45) e `main.tf` (locals `dos_leitores` e `dos_escritores`, concatenados na política)._
- [x] **1.2 O Sid começa pelo nome da entrada.** _Evidência: caso `entradas_com_curinga_reproduzem_o_escopo_total`, que casa a lista de Sids do plano com `ConsumidoresAutorizados`, `LeitoresDeForaConectam`, `LeitoresDeForaLeem`, `LeitoresDeForaCoordenam`, `EscritoresDeForaConectam`, `EscritoresDeForaEscrevem`._
- [x] **1.3 Leitor conecta sem escrita idempotente.** _Evidência: no mesmo caso, `LeitoresDeForaConectam` tem `Connect` e `DescribeCluster`, e `EscritoresDeForaConectam` tem as duas mais `WriteDataIdempotently`._
- [x] **1.4 Leitor sem grupo não gera coordenação.** _Evidência: caso `leitor_sem_grupo_nao_gera_coordenacao`, com os Sids `ConsumidoresAutorizados`, `LeitorConectam` e `LeitorLeem`, e nenhum de grupo._
- [x] **1.5 Nome repetido entre os dois mapas é recusado.** `precondition` do recurso, porque `validation` de variável não enxerga a outra variável. _Evidência: caso `mesmo_nome_nos_dois_mapas_e_recusado`, com `expect_failures = [aws_msk_cluster_policy.esta]`._
- [x] **1.6 Nome que não serve como Sid e entrada vazia são recusados.** _Evidência: casos `nome_com_hifen_e_recusado`, `prefixo_da_receita_e_recusado` e `entrada_sem_topico_e_recusada`, todos com `expect_failures = [var.leitores]` ou `[var.escritores]`._
- [x] **1.7 Sem entradas, a política fica do tamanho de antes.** _Evidência: caso `sem_entradas_a_politica_fica_como_era`, que mede cinco statements com as listas antigas preenchidas e os dois mapas vazios._
- [x] **1.8 Os sete casos moram no repositório.** 550d0b0 citava sete casos que tinham rodado fora dele. _Evidência: 8796cff, `catalogo/ligacoes/politica-msk-cluster/tests/politica.tftest.hcl`, com `mock_provider "aws" {}`; `terraform init -backend=false && terraform test` na pasta da receita devolveu `Success! 7 passed, 0 failed`. O arquivo cresceu depois, em ab2c821, com os casos das listas de escopo compartilhado, que são change à parte._

## 2. O cluster alcança a VPC de fora

- [x] **2.1 `cidrs_vpc_connectivity` no organismo.** Cada CIDR declarado ganha regra de entrada em 14001-14100. _Evidência: 5d16932, `catalogo/organismos/barramento/msk-cluster/main.tf` (`aws_vpc_security_group_ingress_rule.vpc_connectivity`, `for_each` sobre a lista) e `variables.tf` (+21), com `terraform validate` verde._
- [x] **2.2 CIDR IPv4 e piso de prefixo `/16`.** _Evidência: as duas `validation` da variável, uma com `cidrnetmask(c)` e outra com o número depois da barra `>= 16`, o mesmo piso de `origens_do_endpoint` na `vpc-dominio`._
- [ ] **2.3 Casos de `terraform test` do organismo.** Faltam os dois casos de recusa (`/8` e valor sem máscara) e o de lista vazia, que hoje só têm `terraform validate` e o apply da instalação como prova. A ligação tem os sete casos dela desde 8796cff; o organismo não tem arquivo de teste.

## 3. Medido numa instalação

- [x] **3.1 Apply das quatro células, em 2026-09-11.** Duas do organismo do cluster e duas da ligação da política, num ambiente não-produtivo e num de produção. _Evidência: organismo, `1 a criar, 0 a alterar, 0 a destruir` em cada ambiente, a regra de 14001-14100; ligação, `0 a criar, 1 a alterar, 0 a destruir` em cada, código 0 nos quatro applies._
- [x] **3.2 A política planejada bateu com a viva.** A política tinha sido editada no console naquela manhã, e o apply substitui a política inteira. Os Sids vindos do nome da entrada permitiram casar statement por statement antes de aplicar. _Evidência: comparação normalizada do JSON planejado com o vivo, com três diferenças declaradas antes do apply: uma conta consumidora voltou à lista de autorizados, uma conta legada saiu da lista do ambiente em que não tem conexão privada, e os consumidores legados perderam `WriteDataIdempotently`, que não fazia nada sem `WriteData`. Depois do apply, a comparação nos dois ambientes não acusou diferença._
- [x] **3.3 O consumo ativo não parou.** _Evidência: `MaxOffsetLag = 0` no grupo que lia um tópico do barramento, minuto a minuto em 25 minutos seguidos, cobrindo a janela do apply; `ConnectionCount` dos três brokers do cluster não-produtivo entre 3 e 6 na mesma janela, sem queda._
- [x] **3.4 A faixa do código cobre o que a instalação tinha aberto à mão.** O bootstrap da conexão tinha sido destravado no console, porta a porta. _Evidência: `1 a criar, 0 a alterar, 0 a destruir` no organismo de cada ambiente, criando a regra de 14001-14100, que contém as portas abertas lá._

## 4. O catálogo continua inteiro

- [x] **4.1 Contrato das duas peças.** _Evidência: `CONTRATO.md` e `contrato.json` de `politica-msk-cluster` declaram `leitores` e `escritores` em `recebe` e em `colecoes_de_config`, e os de `barramento/msk-cluster` declaram `cidrs_vpc_connectivity`._
- [x] **4.2 Formatação e portões.** _Evidência: `terraform fmt -check -recursive` verde com o arquivo de teste dentro do catálogo; numa instância, os portões de prosa, caminhos, ilustrativo, fila, mapas, contratos e região seguem verdes._
- [x] **4.3 `openspec validate acesso-de-fora-ao-barramento --strict`.** _Evidência: `Change 'acesso-de-fora-ao-barramento' is valid`._
