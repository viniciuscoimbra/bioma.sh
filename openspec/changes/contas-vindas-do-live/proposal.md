## Why

A tela guarda as contas em `tela/contas.json`, digitadas à mão. Uma instância já
tem essas contas escritas em `infra/contas.hcl`, com o número, a família e a
regra que decide em qual delas cada célula roda. As duas listas vivem separadas,
e nada reclama quando divergem.

Divergir é o caso comum, não o raro. A instância privada de referência trocou catorze
contas de lugar numa rodada: quem tivesse desenhado na tela continuaria vendo as
antigas, e o desenho apontaria conta que não existe mais. Gerar os seis projetos
`.bio` daquela instância exigiu extrair o mapa por fora, com um parser escrito na
hora, e ainda assim as contas saíram no formato errado, que a tela não aceita.

## What Changes

- Uma ferramenta lê o mapa de contas de uma instância e devolve a lista no
  formato que a tela usa (`apelido`, `numero`, `area`, `padrao`).
- A área de cada conta sai da própria família do nome, porque é o que a
  instância já declara: `faturamento-nprd` é da área Barramento.
- A tela ganha a rota que importa esse mapa e substitui a lista dela.
- Conta com número que não existe ainda (id ilustrativo de instância que não foi
  provisionada) entra do mesmo jeito, porque é o estado real de quem está
  desenhando antes de aplicar.

## Capabilities

### New Capabilities

- `contas-do-live`: como a lista de contas de uma instância chega ao desenho.

## Impact

- Quem digita conta à mão continua digitando: a importação é um caminho a mais,
  e não substitui o formulário.
- A importação sobrescreve a lista inteira, e isso está dito na resposta da
  rota. Lista digitada e não salva se perde.
- `tela/contas.json` continua sendo estado local, fora do versionamento.
