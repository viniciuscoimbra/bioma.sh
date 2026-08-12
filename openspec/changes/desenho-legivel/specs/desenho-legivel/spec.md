## ADDED Requirements

### Requirement: O desenho de uma árvore se lê

O layout SHALL sair da estrutura (profundidade de dependência em colunas, conta
em faixas), SHALL ser determinístico, e a tela SHALL oferecer uma página por
fase de entrega além da visão inteira. A posição ajustada na tela SHALL
sobreviver ao ciclo salvar → abrir, e a `origem` do projeto SHALL sobreviver ao
salvar.

#### Scenario: duas leituras, o mesmo desenho

- **WHEN** a mesma árvore é lida duas vezes
- **THEN** cada peça recebe a mesma posição nas duas leituras

#### Scenario: página da fase

- **GIVEN** um projeto cujas peças carregam `fase`
- **WHEN** a pessoa abre a página da fase 2
- **THEN** o canvas mostra só as peças da fase 2, e a lista lateral segue inteira

#### Scenario: ajuste que não se perde

- **WHEN** a pessoa move uma peça, salva o projeto e o reabre
- **THEN** a peça está onde ela a deixou, e `origem.comando` continua no projeto
