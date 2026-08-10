## ADDED Requirements

### Requirement: A relação declara quantos de cada lado
Toda relação SHALL trazer `cardinalidade` com `1:1`, `1:N` ou `N:N`, e a razão
da classificação em português. A forma do N SHALL vir do contrato da ligação
escolhida, e não da relação, porque é a receita que decide se o N entra por
lista ou por célula. Relação sem o campo SHALL valer como `1:1`, que é o
comportamento de hoje.

#### Scenario: Aresta com ponta plural
- **WHEN** a aresta termina em `todas as contas`
- **THEN** a relação sai `1:N`

#### Scenario: Aresta entre duas peças nomeadas
- **WHEN** o cluster do barramento publica no lake
- **THEN** a relação sai `1:1`

### Requirement: O contrato da ligação declara a cardinalidade que ela implementa
Todo `contrato.json` de ligação SHALL trazer `cardinalidade`, e ela SHALL bater
com o `variables.tf`: variável de tipo lista ou mapa que nomeia o outro lado
implica N.

#### Scenario: Contrato que diz menos do que a receita faz
- **WHEN** o contrato declara `1:1` e o `variables.tf` pede `contas_consumidoras` como lista
- **THEN** o verificador reprova, nomeando a ligação, o campo e os dois valores

#### Scenario: Catálogo coerente
- **WHEN** todas as ligações declaram a cardinalidade que implementam
- **THEN** o verificador passa e diz quantas ligações conferiu

### Requirement: A forma do N é explícita
Ligação com N SHALL dizer se o N entra por lista dentro de uma célula ou por uma
célula por alvo, porque as duas formas geram árvores diferentes.

#### Scenario: N por lista
- **WHEN** a ligação é `politica-msk-cluster`, que recebe `contas_consumidoras`
- **THEN** a forma é `lista`, e uma célula atende todos os alvos

#### Scenario: N por célula
- **WHEN** a ligação é `oam-link`, que nasce na conta fonte
- **THEN** a forma é `celula`, e cada conta observada pede a sua
