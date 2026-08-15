## ADDED Requirements

### Requirement: A receita declarada vence o esqueleto
Nó com campo `receita` SHALL gerar célula apontando a receita do catálogo, e o
gerador SHALL NOT inventar receita nova para ele. Nó sem `receita` SHALL
continuar recebendo o esqueleto do mapa de recursos.

#### Scenario: Nó que declara receita existente
- **WHEN** o nó declara `organismos/rede/vpc-dominio` e a receita existe no catálogo
- **THEN** a célula gerada aponta essa receita, e o catálogo gerado não ganha cópia dela

#### Scenario: Nó que declara receita inexistente
- **WHEN** a receita declarada não existe no catálogo
- **THEN** a geração diz isso por escrito na célula e na ficha, em vez de inventar

### Requirement: O caminho declarado vence a convenção
Nó com campo `id` SHALL virar célula naquele caminho. Nó sem `id` SHALL seguir
a convenção do gerador.

#### Scenario: Projeto importado de instância
- **WHEN** o `.bio` nasceu de uma instância e todo nó tem `id`
- **THEN** a árvore gerada tem as mesmas células, nos mesmos caminhos

### Requirement: A ida e volta é a régua
A change SHALL ser medida por `ida_e_volta.py` contra um projeto real, e SHALL
fechar quando células, receitas e arquivos zerarem.

#### Scenario: Medição de aceite
- **WHEN** `ida_e_volta.py` roda contra o projeto de referência da instância
- **THEN** as três alturas reportam zero distância, ou a change segue aberta
