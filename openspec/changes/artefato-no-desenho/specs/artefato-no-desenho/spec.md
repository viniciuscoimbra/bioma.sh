## ADDED Requirements

### Requirement: Artefato aparece no desenho com dono e entrega
O grafo SHALL aceitar nó de natureza `artefato`, com o trilho dono e a lista do
que ele entrega. O tradutor SHALL acrescentar ao desenho os artefatos do
catálogo cujo dono é um trilho presente naquele recorte.

#### Scenario: Desenho da esteira
- **WHEN** o recorte inclui o trilho `plataforma/esteira`
- **THEN** o desenho traz o nó `esteira-workflows`, com os seis arquivos que ele entrega

#### Scenario: Recorte que não tem o dono
- **WHEN** o recorte é só do barramento
- **THEN** nenhum artefato de outro trilho entra no desenho

### Requirement: Artefato não é célula do live
Nó de artefato SHALL NOT gerar célula na árvore, e a tela SHALL dizer que ele é
entregue à esteira em vez de aplicado pelo comando.

#### Scenario: Geração da árvore com artefato no desenho
- **WHEN** a árvore é gerada a partir de um desenho que tem artefato
- **THEN** nenhuma pasta de célula nasce para ele, e o interior dele entra no pacote que a pessoa leva

### Requirement: A tela rotula o que ela não conhecia
A tela SHALL mostrar etiqueta própria para artefato, com verbete de ajuda em
EN-US e PT-BR pelo dicionário. Nó de natureza desconhecida SHALL continuar
aparecendo sem quebrar a tela, e SHALL dizer que a natureza não é conhecida.

#### Scenario: Nó de artefato no canvas
- **WHEN** o desenho da esteira abre na tela
- **THEN** o artefato aparece com a etiqueta dele, e o clique abre o verbete que explica o que é artefato

#### Scenario: Natureza que a tela não conhece
- **WHEN** um `.bio` traz nó com natureza que a tela não tem
- **THEN** o nó aparece, sem etiqueta inventada, e com o aviso de natureza desconhecida
