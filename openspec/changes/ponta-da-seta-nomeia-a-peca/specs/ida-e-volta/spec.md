## ADDED Requirements

### Requirement: A ponta da aresta nomeia a peça como a tabela de serviços nomeia
A especificação escrita pela tela SHALL escrever, na coluna de origem e na de
destino da tabela de arestas, o `servico` do nó quando a ponta for um nó do
desenho. Ponta que não é nó do desenho SHALL sair como o texto que veio, que é
o que `de_classe` e `para_classe` já classificam. Os campos `de` e `para` do
grafo SHALL continuar guardando o id, para não mudar o `.bio` de quem já salvou.

A razão é o encaixe: o tradutor casa a ponta contra a coluna `serviço` da tabela
de serviços, e o id do nó não existe naquela tabela.

#### Scenario: Desenho da tela vira árvore
- **WHEN** um grafo com duas peças ligadas por uma seta sai da tela e volta pelo tradutor
- **THEN** as duas pontas da relação casam com peças da proposta, nenhuma peça sai solta, e o diagnóstico não acusa erro

#### Scenario: Ponta que sai do recorte
- **WHEN** a seta termina em `04-plataforma-dados`, que não é nó do desenho
- **THEN** a coluna traz `04-plataforma-dados`, sem inventar peça

#### Scenario: O projeto salvo não muda
- **WHEN** um `.bio` salvo antes desta mudança é reaberto
- **THEN** `de` e `para` continuam trazendo o id do nó
