# Tasks — artefato no desenho

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
>
> **Estado**: executada em 2026-08-08, com prova de navegador olhada.

## 0. O que já se sabe

- [x] **0.1 Tipo desconhecido não quebra a tela.** `etiquetaDe()` em `painel-decisoes.jsx` devolve `null` quando a natureza não é fronteira, ligação nem tubo, e o nó aparece sem etiqueta. _Evidência: a função lida; o nó fica sem rótulo e sem verbete, que é o defeito a corrigir, não um travamento._
- [x] **0.2 Confirmar que artefato entra no desenho pelo dono.** _Evidência: aprovado pelo Vinícius em 2026-08-08; o contrato do artefato ganhou `trilhos` para os casos em que o dono e o trilho têm nomes diferentes (`plataforma/esteira` contra o trilho `devsecops`)._

## 1. O grafo

- [ ] **1.1 Nó de artefato.** _Evidência: `esteira.bio` passou de 8 para 9 nós, e o novo é `esteira-workflows`, unidade `artefato`, trilho `devsecops`, com os seis arquivos na entrega._ **REABERTA: no roundtrip pela especificação o artefato volta como organismo, porque `especificacao()` não preserva a natureza.**
- [x] **1.2 O tradutor lê o catálogo de artefatos.** _Evidência: a proposta do bloco 15 traz `artefato: esteira-workflows | trilho: devsecops | entrega: 6 arquivos`._
- [x] **1.3 Recorte sem o dono não traz o artefato.** _Evidência: a proposta do bloco 01 sai com `artefatos: nenhum`._

## 2. A árvore e o pacote

- [x] **2.1 Artefato não vira célula.** _Evidência: na árvore gerada do bloco 15, `find live -name '*esteira-workflows*'` volta vazio._
- [ ] **2.2 O artefato entra no pacote, fora do live.** _Evidência: `artefatos/esteira-workflows/LEIA-ME.md` com o dono e os seis arquivos listados, e a frase de que o comando não aplica artefato._ **REABERTA: só o `LEIA-ME.md` é escrito. Os seis workflows de `catalogo/artefatos/esteira-workflows/workflows/` não são copiados para o pacote.**

## 3. A tela

- [ ] **3.1 Etiqueta própria.** _Evidência: foto olhada. O card traz a etiqueta `artefato` e o painel de decisões mostra `artifact, handed to the pipeline`. A foto cobrou um defeito que o código não mostrava: o card pedia conta ao artefato, e artefato não mora em conta. Corrigido para `sem conta: entregue à esteira`, e a segunda foto confirma o seletor ausente._ **REABERTA: a etiqueta chama `<Ajuda verbete="artefato">` e não existe verbete `artefato`; o clique prometido não abre nada.**
- [x] **3.2 Microcopy nas duas línguas.** _Evidência: em EN, `artifact, handed to the pipeline` e `no account: handed to the pipeline`; em PT, `artefato, entregue à esteira` e `sem conta: entregue à esteira`, os dois lidos na tela pelo seletor de idioma._
- [ ] **3.3 Natureza desconhecida avisa.** _Evidência: `etiquetaDe()` passou a devolver a etiqueta `desconhecida` para natureza fora da lista, com borda tracejada e sem verbete inventado. Antes devolvia `null` e o nó ficava sem rótulo nenhum._ **REABERTA: a lógica existe, e o caminho que levaria a ela não: a natureza vinda de um `.bio` é recalculada pelo tradutor antes de chegar à etiqueta.**
- [x] **3.4 Portões.** _Evidência: os quatro verdes, com `tela/estatico` reconstruído e versionado no mesmo commit._
