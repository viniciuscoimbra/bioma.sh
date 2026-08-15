## Why

A regra pétrea promete que abrir o `.bio` regera o código da instância. A
primeira medição (`ida_e_volta.py`, 2026-08-15, contra um projeto real de 112
células) diz que a promessa quebra no gerador, e diz onde:

- **células**: o desenho e a instância falam dos MESMOS 112 lugares; o `.bio`
  está fiel
- **receitas**: o desenho pede 49 receitas pelo campo `receita` de cada nó; o
  gerador escreveu 200 OUTRAS, com nomes inventados, e nenhuma das 49
- **arquivos**: interseção zero; o gerador escreve
  `live/<conta>/<ambiente>/<nome-achatado>` enquanto a instância vive em
  `<dominio>/<ambiente>/<peça>`

O gerador ignora os dois campos que o nó declara (`receita` e `id`) e escreve
uma árvore com a própria convenção. Funciona para desenho que nasce do zero na
tela; não regera projeto nenhum que exista.

## What Changes

- O nó que declara `receita` recebe a receita do catálogo, e não um esqueleto
  de nome inventado. O esqueleto continua existindo para o nó que NÃO declara,
  que é o desenho nascendo do zero.
- O nó que declara `id` vira célula naquele caminho. A convenção
  `live/<trilho>/<alcance>/<nome>` continua sendo o default de quem não
  declara.
- `ida_e_volta.py` acompanha como régua: a change fecha quando as três alturas
  zeram contra o projeto real.

## Capabilities

### New Capabilities

- `geracao-fiel`: o que o gerador garante para um `.bio` que declara receita e caminho.

## Impact

- `gerar_iac.py` e a tradução que o alimenta (`traduzir_bloco.py`,
  `servidor.gerar`).
- Desenho nascido na tela não muda de comportamento: sem `receita` e sem `id`
  declarados, tudo segue como hoje.
