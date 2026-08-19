# Capability: ida e volta

## MODIFIED Requirements

### Requirement: cada célula do desenho gera a célula dela

O gerador SHALL escrever uma célula por nó do desenho. Duas células que usam a mesma
receita geram arquivos distintos, cada uma com as respostas que a sua ficha
guarda.

#### Scenario: duas células da mesma receita, respostas diferentes

- **GIVEN** um `.bio` com `core-bancario/prd/dados/banco-core` e
  `core-bancario/hml/dados/banco-core`, ambas apontando
  `moleculas/banco-instancia`
- **AND** a de produção respondeu `retencao_backup_dias = 30` e a de
  homologação respondeu `7`
- **WHEN** o código é gerado a partir do `.bio`
- **THEN** o terragrunt de produção traz `30` e o de homologação traz `7`
- **AND** o nome de cada uma é o que a sua ficha guarda

#### Scenario: o caminho gerado é o caminho da instância

- **GIVEN** um nó cujo `id` é `core-bancario/prd/dados/banco-core`
- **WHEN** o código é gerado
- **THEN** o terragrunt sai em `core-bancario/prd/dados/banco-core/`
- **AND** `ida_e_volta.py` casa esse arquivo com o da instância

### Requirement: a distância é medida, e o portão trava quando ela zera

`ida_e_volta.py` SHALL comparar em três alturas: células, receitas e
arquivos. Enquanto qualquer uma delas for maior que zero, ele é relatório.
Zerando as três, ele SHALL reprovar quem as abrir de novo.

#### Scenario: a árvore do gf-infrastructure fecha

- **GIVEN** o `.bio` com as 199 células da fase 1
- **WHEN** `ida_e_volta.py` roda contra a instância
- **THEN** as três alturas são zero
