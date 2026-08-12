## ADDED Requirements

### Requirement: O plano de entrega é calculado da árvore, não escrito à mão

O sistema SHALL calcular as fases de entrega a partir do grafo de dependências
(`config_path`) e dos metadados declarados (contratos, convenções), e SHALL
recusar plano cuja árvore de origem mudou.

#### Scenario: dependência não pode atravessar fase para frente

- **GIVEN** uma árvore com a célula A na fase 2 e a célula B na fase 3
- **WHEN** A declara `config_path` para B
- **THEN** o cálculo move A para depois de B ou reprova nomeando as duas fases

#### Scenario: irreversível ganha fase própria e canário

- **GIVEN** células cujo contrato declara efeito irreversível (conta, e-mail)
- **WHEN** o plano é calculado
- **THEN** elas formam fase própria, com uma célula canário antes do lote

#### Scenario: árvore mudou, plano estale

- **GIVEN** um `entrega.json` calculado da árvore no estado X
- **WHEN** a árvore está no estado Y ≠ X e o executor recebe esse plano
- **THEN** a execução é recusada antes de tocar a nuvem
