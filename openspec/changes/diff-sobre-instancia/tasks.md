# Tasks — diff sobre instância

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.
>
> **Estado**: executada em 2026-08-08. Falta a tela mostrar o resultado ao lado
> da árvore, que é interface e pede foto olhada.

## 0. A decisão que destrava

- [x] **0.1 Confirmar que a comparação é entre desenho e código no disco.** _Evidência: aprovado pelo Vinícius em 2026-08-08; a ferramenta imprime isso na primeira linha da saída._
- [x] **0.2 Confirmar que remoção de permanente é aviso.** _Evidência: aprovado na mesma resposta._

## 1. A comparação

- [ ] **1.1 Nasce, muda e achado.** _Evidência: o desenho do barramento contra `implementacao/bioma/infra/plataforma` devolve 16 células que nascem e 11 achados, no recorte `barramento`; sem o recorte a saída afogava em 94 células de outros trilhos._ **REABERTA pelo parecer Codex de 2026-08-08: a spec diz `nasce`, `muda` e `sai`, e o retorno não tem `sai`. O que sai virou `achados`, que é outra coisa.**
- [ ] **1.2 Mudança por campo.** _Evidência: com a receita de uma célula trocada na árvore, sai `muda barramento/prd/msk · receita: organismos/barramento/msk-cluster → organismos/barramento/msk`. A conta não é campo da célula nesta instância: ela vem do `root.hcl` pelo caminho, então o campo comparável é a receita._ **REABERTA: só `receita` é comparada. A spec cita conta, e a conta não é comparada em lugar nenhum.**
- [ ] **1.3 Desenho igual à árvore devolve vazio.** _Evidência: contra a árvore gerada do próprio desenho, `batem: nada nasce, nada muda, nada sai`, código 0._ **REABERTA: a condição de `batem` ignora `avisos`. Com uma célula permanente sumida do desenho, o programa diz que batem e sai zero. Reproduzido.**

## 2. As travas

- [ ] **2.1 Permanente que sumiu vira aviso.** _Evidência: célula na árvore apontando receita de contrato permanente sai como `aviso ... é permanente e sumiu do desenho: não cai por rotina`, e não como remoção. A durabilidade vem do contrato da receita, e não do desenho, porque célula que só existe na árvore não tem desenho de onde tirar._ **REABERTA: o aviso é calculado e nunca impresso quando é o único achado, pela mesma condição de `batem`.**
- [ ] **2.2 Célula sem desenho vira achado.** _Evidência: `achado barramento/nprd/appconfig-coexistencia existe na árvore e não vem de desenho nenhum`. Sem histórico do desenho anterior não dá para separar "saiu do desenho" de "nunca esteve nele", e a saída diz isso em vez de afirmar a diferença._ **REABERTA: célula efêmera legitimamente removida também vira achado, então achado e remoção não se distinguem.**

## 3. A tela

- [ ] **3.1 O mesmo resultado ao lado da árvore.** _Falta: a ferramenta responde por linha de comando; a tela ainda não chama. Pede rota, componente e foto olhada._
- [x] **3.2 Portões.** _Evidência: compila, constroi, arvore e tela verdes._
