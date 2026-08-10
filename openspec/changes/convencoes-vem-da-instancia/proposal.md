## Why

O README promete que a instância não mora aqui. O código não cumpre.

Levantamento de 2026-08-08, com `grep` por nome de domínio de cliente nas
ferramentas: **34 linhas**, em três arquivos.

| arquivo | linhas | roda hoje? |
|---|---:|---|
| `gerar_estrutura.py` | 12 | não: quebra com `FileNotFoundError`, porque o `inventario.json` ficou na instância |
| `verificar_cobertura.py` | 10 | não: responde "sem insumo para decidir" e sai zero |
| `traduzir_bloco.py` | 2 | sim |

As duas primeiras ficaram do split do repositório e nunca foram limpas. A
segunda é pior do que morta: está no pré-voo do `bioma.sh` como `confere
cobertura`, então é um portão que pula silenciosamente em toda execução, e
ninguém percebeu porque pular não reprova.

O que sobra em `traduzir_bloco.py` não é nome de cliente, e é o problema de
verdade: `ZONA_TRILHO` mapeia zona para trilho com nomes que são de instância
(`dados`, `esteira`, `observabilidade`, `seguranca`, `rede`). Quem desenhar
outra arquitetura recebe um mapa que não descreve a dela, e o resultado é o
defeito que esta sessão achou: `Platform · Barramento` indo parar no trilho da
observabilidade.

A pergunta que separa as duas coisas: **isto é propriedade da ferramenta ou da
árvore de quem opera?** "OU agrupadora não recebe conta" é da ferramenta.
"Credito é agrupadora" é da árvore. "Workload tem três ambientes" é da árvore.
"A natureza da OU decide quantos ambientes existem" é da ferramenta.

## What Changes

- `ZONA_TRILHO` deixa de ter valor embutido: o mapa de zona para trilho vem das
  convenções da instância, e o padrão da ferramenta fica vazio.
- Zona sem mapa continua virando trilho pelo nome, como hoje, e passa a dizer
  que foi assim por falta de convenção, em vez de silenciosamente.
- `gerar_estrutura.py` e `verificar_cobertura.py` vão para o repositório da
  instância, que é onde o `inventario.json` delas já está.
- O pré-voo do comando para de chamar um verificador que não tem insumo aqui,
  ou passa a apontar o da instância.
- `COLETIVO`, que classifica ponta plural, é regex só em português (`todas`,
  `blocos`, `domínios`). A interface promete EN-US como padrão, e uma
  especificação em inglês nunca classificaria 1:N.

## Capabilities

### New Capabilities

- `convencoes-da-instancia`: o que a ferramenta traz por padrão e o que ela
  exige que a instância declare.

## Impact

- Quem desenha sem arquivo de convenções perde o mapa de zona embutido, e as
  zonas passam a virar trilho pelo nome. Para as instâncias que usam a notação
  de topo e OU (`Platform · Barramento`), nada muda, porque elas não passam pelo
  mapa.
- Mover as duas ferramentas tira do framework um portão que hoje é inerte. A
  cobertura continua existindo, no lugar onde ela tem o inventário.
- O padrão de ambientes por natureza permanece embutido, e continua
  sobrescrevível: ele é o único que a ferramenta precisa ter para funcionar sem
  arquivo nenhum.
