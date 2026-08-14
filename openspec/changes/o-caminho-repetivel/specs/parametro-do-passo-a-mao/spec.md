## ADDED Requirements

### Requirement: Passo à mão é parâmetro previsto no framework
Todo passo que alguém executa fora do comando SHALL constar da tabela de
parâmetros do framework, com o texto do que ele é, o formato esperado e o
default quando houver um que caiba. A instância SHALL herdar essa tabela e
SHALL poder acrescentar, nunca reescrever.

#### Scenario: Instância nova
- **WHEN** uma instalação nova roda a instalação
- **THEN** ela recebe a mesma lista de passos previstos que qualquer outra, sem ninguém redigitar

#### Scenario: Parâmetro com default que cabe
- **WHEN** o parâmetro tem default (o nome de uma role convencionada, uma região secundária)
- **THEN** a pergunta mostra o default e aceita Enter

#### Scenario: Parâmetro sem default possível
- **WHEN** o parâmetro é um ARN emitido pela conta do cliente
- **THEN** não há default, e a resposta em branco fica registrada como pendente com a célula que ela trava

### Requirement: O comando faz o passo quando ele é automatizável
A ferramenta SHALL executar o passo à mão que for sequência determinística de
chamadas, e SHALL registrar no diário o que fez. Passo automatizável SHALL NOT
continuar como instrução de runbook.

#### Scenario: Números das contas depois do vending
- **WHEN** o passo que cria as contas termina
- **THEN** o comando colhe os identificadores da Organization e os grava no ambiente da instância, sem pedir que alguém rode outro script

#### Scenario: Passo que depende de decisão humana
- **WHEN** o passo exige escolher entre alternativas (qual provedor de identidade, qual faixa de endereço)
- **THEN** ele continua sendo parâmetro, e não vira automação que escolhe sozinha
