# Tasks — o caminho do zero

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 0. A medida que motivou

- [x] **0.1 O caminho do zero exercido no navegador.** _Evidência: canvas vazio, assistente pulado, `s3` e `lambda` postos pela busca, seta desenhada, gaveta com 13 arquivos, código à vista, zip de 6.687 bytes baixado._
- [x] **0.2 O que saiu do zip foi validado.** _Evidência: `terraform validate` no organismo do bucket devolve `Success`; no da função devolve 3 erros (`filename|image_uri|s3_bucket` e auto-referência em `function_name`)._
- [x] **0.3 A ligação não chegou na estrutura.** _Evidência: `live/plataforma/nao-prod/lambda-function/terragrunt.hcl` não tem nenhum bloco `dependency`._

## 1. A seta vira dependência

- [x] **1.1 `dependency` na célula de destino.** _Evidência: no barramento, 12 de 16 células saem com o bloco; em `live/barramento/prd/lambda` sai `dependency "eventbridge-scheduler"` com `config_path = "../../prd/eventbridge-scheduler"`, e `terragrunt hcl validate` na árvore gerada devolve zero erro, o que prova que os caminhos resolvem._
- [ ] **1.2 O input consome o output da origem.** _Falta: o bloco existe e fixa a ordem, e o input ainda não referencia `dependency.<nome>.outputs.<x>`. Sem isto a ordem está certa e o valor continua vindo da ficha._ **Medido em 2026-08-10: zero. Nas seis áreas, 77 células, 37 com bloco `dependency`, e nenhuma com `.outputs.` no input. `resposta_da_vizinha()` existe e é estrita de propósito (só liga quando o argumento termina no nome da vizinha e não é role, kms, log nem policy), e nas especificações reais ela nunca dispara. A regra não está errada; a cobertura dela é nula, e o valor continua saindo como `PREENCHER`.**
- [x] **1.3 Peça sem seta não ganha dependência.** _Evidência: 4 das 16 células do barramento saem sem bloco nenhum, que são as que não recebem seta._

## 2. O provider fala

- [x] **2.1 A conferência roda na entrega, e não na geração.** _Evidência: ligada em `/gerar`, derrubou a prova de tela para 11 de 14, porque a geração passou a levar minutos; movida para baixar e materializar, que é o último ponto antes de o arquivo sair._ ~~ _Evidência: a chamada, e a reclamação dentro do arquivo._
- [ ] **2.2 A ficha pergunta o que falta.** _Evidência: a pergunta na tela, nas duas línguas._

## 3. O defeito próprio

- [x] **3.1 Fim da auto-referência.** _Evidência: `liga_interno` passou a saber em qual recurso está escrevendo, e o que não é ligável vira pergunta: `function_name = var.lambda_function_function_name` no lugar de `aws_lambda_function.lambda.function_name`. A regra unitária que pega isso está em `testes/unidade.py`._

## 4. O portão

- [ ] **4.1 O caminho do zero entra em `testes/portoes.sh`.** _Falta: o portão de navegador. Entrou antes o portão `unidade`, que é o barato e pega o que o e2e não pegava._

## 5. As regras da receita

- [x] **5.1 Suíte unitária.** `testes/unidade.py` confere, sem nuvem e sem provider: dependência aponta célula existente; mock declara só o que a origem publica; nada se auto-referencia; receita sem recurso diz por quê; ARN nunca é literal; `PREENCHER` tem pergunta. _Evidência: na primeira execução acusou 5 queixas em dois blocos (a auto-referência do lambda e quatro dependências apontando `conta/nao-prod/emr-glue`, que não existe); depois do conserto, `nenhuma queixa`._
- [x] **5.2 A receita publica o que a vizinha consome.** _Evidência: 7 das 8 receitas do barramento saem com `output id` e `output arn`; a oitava não publica porque o mapa não conhece o serviço, e o `main.tf` dela diz isso por escrito. Nenhum `TODO(saídas)` restou._
- [x] **5.3 O mock para de mentir.** _Evidência: o mock passou a sair das saídas reais da origem; onde a origem não publica nada, a dependência diz que existe só para fixar a ordem, em vez de simular um `arn` inexistente._
- [x] **5.4 O portão `unidade` entra em `testes/portoes.sh`.** _Evidência: cinco portões verdes, em 31s._

## 6. O que a auditoria externa derrubou, e o que sobrou

Dois pareceres do Codex (gpt-5.6-sol, somente leitura) sobre este trabalho, em
2026-08-09. Os dois reprovaram. O que foi corrigido no mesmo dia:

- [x] **6.1 Direção da dependência.** A seta é ordem do fluxo, e virava ordem de criação: o relógio dependia da função que ele dispara, e o bloco de dados ganhava dois ciclos. Agora o esquema decide quando consegue, e o padrão é quem dispara depender de quem recebe. _Evidência: `sched depende de lambda-esm`; a referência mostra a lambda dependendo do balde onde antes o balde dependia dela._
- [x] **6.2 Colisão de apelido.** `AWS Lambda (ESM)` e `AWS Lambda (Consumer de DLT)` viravam `lambda` e uma sobrescrevia a outra. _Evidência: `lambda-esm` e `lambda-consumer-dlt`; o barramento passou de 16 para 18 células._
- [x] **6.3 Recurso errado.** `MSK Connect (S3 Sink)` virava um balde e `VPC Gateway Endpoint` virava uma VPC. _Evidência: agora `aws_mskconnect_connector` e `aws_vpc_endpoint`; o mapa foi de 17 para 44 entradas, conferidas contra o esquema._
- [x] **6.4 Medida que mentia a favor.** 32 das 50 receitas não criavam recurso, e módulo vazio valida. _Evidência: `seis-areas.py` separa as colunas; das 89 receitas, 76 têm recurso._
- [x] **6.5 ARN errado na única ligação de valor.** `service_execution_role_arn` recebia o ARN do cluster MSK, e o Terraform aceita porque os dois são texto. _Evidência: o nome da vizinha agora precisa fechar o argumento, e argumento de role, chave ou log não recebe ligação automática; a regra e o contra-caso estão em `unidade.py`._
- [x] **6.6 Corte de ciclo arbitrário.** Dependia da ordem da tabela. _Evidência: ordem estável, o mesmo corte nas duas ordens de entrada, e o ciclo é anunciado na geração._

O que a segunda auditoria deixou aberto, e é decisão de produto:

- [x] **6.7 O mapa escolhe recurso pelo papel.** _Evidência: `refina_por_papel` conferida contra o esquema; `AWS Lambda (ESM)` com papel de consumo vira `aws_lambda_event_source_mapping`, `SCP (Organizations)` com papel de guardrail vira `aws_organizations_policy`, Glue com papel de job vira `aws_glue_job`. Dez verificações na camada 0._ ~~ `AWS Lambda (ESM)` não cria `aws_lambda_event_source_mapping`; `AWS Glue (Catalog + jobs)` não cria `aws_glue_job`; `SCP (Organizations)` cria uma organização em vez de `aws_organizations_policy`. A tabela casa por nome de serviço, e o papel está escrito na coluna ao lado, no bloco.
- [ ] **6.8 A direção acerta por padrão, e não por prova.** Nos quatro pares auditados o esquema não desempatou nenhum; três acertaram pelo padrão e um errou (`S3 → EMR`: quem lê e escreve no balde é o job).
- [x] **6.9 As receitas vazias caíram de 13 para 3.** _Evidência: entraram Control Tower, IAM, PrivateLink, RAM, Inspector, Cognito, CloudFormation, workspace e OpenMetadata, cada um conferido no esquema; 86 de 89 receitas com recurso. As três que sobram são artefato e template, que não são recurso de nuvem._ ~~ nas seis áreas, com o motivo escrito. São serviços que a tabela ainda não conhece.
