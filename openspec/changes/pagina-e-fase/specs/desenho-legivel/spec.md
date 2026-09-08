## MODIFIED Requirements

### Requirement: O desenho de uma árvore se lê

O layout SHALL sair da estrutura (profundidade de dependência em colunas, conta
em faixas), SHALL ser determinístico, e a tela SHALL oferecer uma PÁGINA por
bloco da arquitetura de referência além da visão de todas as páginas. A posição
ajustada na tela SHALL sobreviver ao ciclo salvar → abrir, e a `origem` do
projeto SHALL sobreviver ao salvar.

A vista filtrada SHALL caber no palco: quando o recorte não couber no piso de
zoom, os elementos SHALL refluir em grade cujo número de colunas sai da largura
medida do palco.

#### Scenario: duas leituras, o mesmo desenho

- **WHEN** a mesma árvore é lida duas vezes
- **THEN** cada peça recebe a mesma posição nas duas leituras

#### Scenario: página do bloco

- **GIVEN** um projeto cujos elementos carregam `pagina`
- **WHEN** a pessoa abre a página `00 · fundação`
- **THEN** o canvas mostra só os elementos daquela página, e a lista lateral
  segue inteira

#### Scenario: uma conta cruzada com uma página

- **GIVEN** uma página cruzada com uma conta que deixa um único elemento
- **WHEN** a pessoa aplica o filtro
- **THEN** o elemento aparece enquadrado no palco, e não atrás de um painel

#### Scenario: ajuste que não se perde

- **WHEN** a pessoa move uma peça, salva o projeto e o reabre
- **THEN** a peça está onde ela a deixou, e `origem.comando` continua no projeto

## ADDED Requirements

### Requirement: A fase é o passo do deploy, e ela é derivada

Cada elemento SHALL carregar `fase`, que é o número do passo da fila de deploy
que alcança aquela célula. A fase SHALL ser derivada de `contrato/fila.json` e
NÃO SHALL ser perguntada a ninguém. Instalação sem fila declarada SHALL deixar a
fase vazia, e não inventar número.

#### Scenario: a fila declara, o desenho deriva

- **GIVEN** uma árvore com `contrato/fila.json` declarando os passos
- **WHEN** o desenho é gerado
- **THEN** cada elemento recebe o passo que o alcança, e nenhum fica sem passo

#### Scenario: passo declarado por segmento

- **GIVEN** um passo que não nomeia domínio e declara `sobre: "aplicacao"`
- **WHEN** uma célula tem `aplicacao` como segmento do caminho
- **THEN** ela recebe aquele passo, e um caminho declarado por domínio ganha do
  segmento

#### Scenario: instalação sem fila

- **GIVEN** uma árvore sem `contrato/fila.json`
- **WHEN** o desenho é gerado
- **THEN** os elementos saem sem fase, e nenhum número é inventado

### Requirement: O `.bio` declara a versão do próprio vocabulário

O `.bio` SHALL declarar a versão do formato, e a leitura SHALL traduzir o
vocabulário antigo a partir dessa versão, e não a partir da aparência dos
valores. A tradução SHALL trocar a CHAVE e preservar o VALOR.

#### Scenario: projeto salvo com o vocabulário antigo

- **GIVEN** um `.bio` de versão 1, com `trilho` e com o bloco em `fase`
- **WHEN** a pessoa o abre
- **THEN** o projeto abre com `dominio` e `pagina` preenchidos, o valor do
  domínio inalterado, e o arquivo passa a declarar versão 2

#### Scenario: página com nome de número

- **GIVEN** um `.bio` de versão 1 cuja página se chama "3"
- **WHEN** a pessoa o abre
- **THEN** "3" continua sendo a página, e não vira fase

### Requirement: A régua da regra pétrea mede byte

A medição de fidelidade entre o `.bio` e o código da instância SHALL comparar os
arquivos byte a byte. Semelhança de linha SHALL servir só para ordenar o que já
se sabe diferente.

#### Scenario: arquivo quase igual

- **GIVEN** um arquivo gerado que difere do da instância em uma linha
- **WHEN** a régua roda
- **THEN** ele é contado como diferente, e o relatório o nomeia
