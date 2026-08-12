# Tasks — a ponta da seta nomeia a peça

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. A especificação nomeia a peça

- [x] **1.1 `especificacao()` resolve o id para o serviço.** `nome_da_ponta()` casa a ponta contra os nós do grafo; ponta que não é nó do desenho sai como o texto que veio. _Evidência: `POST /gerar` com `carimbo.bio` (14 peças, 13 setas). A linha 1 da tabela de arestas era `| 1 | cloudfront | lambda-app | requisição de página, recibo e selo | origin | não |` e passou a `| 1 | Amazon CloudFront | AWS Lambda (app) | requisição de página, recibo e selo | origin | não |`._
- [x] **1.2 O desenho da tela passa a sair.** _Evidência: o mesmo `carimbo.bio` no mesmo `POST /gerar`: antes `erros: 11 · avisos: 40 · pode_sair: false`, com 11 `peça solta` e 26 `ponta fora do desenho`; depois `erros: 0 · avisos: 19 · pode_sair: true`, com as mesmas 13 relações e 85 arquivos. Os 19 avisos que sobram são 6 de serviço fora do `mapa_recursos.json`, 8 de seta que não virou dependência e 5 de valor que só a pessoa sabe._

## 2. O portão que pega isso

- [x] **2.1 `testa_ponta_da_aresta` entra em `testes/unidade.py`.** Monta o grafo como a tela monta (nó com `id` e `servico`, aresta com `de` e `para` em id), escreve a especificação, traduz e roda o mesmo `diagnostico` que a tela roda antes de deixar gravar. _Evidência: `python3 testes/unidade.py` → `ponta da aresta  8 decisões conferidas`, `nenhuma queixa`._
- [x] **2.2 O teste reprova sem o conserto.** _Evidência: revertendo só a chamada de `nome_da_ponta` em `especificacao()`, `python3 testes/unidade.py` sai com 5 queixas e código 1: a aresta escreve `| 1 | aws_s3_bucket-1 | aws_lambda_function-2 | ...`, o diagnóstico acusa `ponta fora do desenho` nas duas pontas e `peça solta` em `['lambda', 's3']`, e `o desenho pode sair` reprova._

## 3. Nada quebrou

- [x] **3.1 Portões.** _Evidência: `bash testes/portoes.sh` com `compila ok`, `constroi ok`, `unidade ok`, `camadas ok`, `arvore ok`, em 53s._
- [x] **3.2 A árvore gerada do `.md` não mudou.** O caminho do documento não passa por `especificacao()`. _Evidência: portão `arvore` ok sem tocar em `testes/arvore_referencia.py`._
- [x] **3.3 O portão `tela` reprova igual antes e depois.** Não é regressão desta change. _Evidência: `bash testes/portoes.sh tela` dá `13/14`, reprovando em `o comando aparece por inteiro`, tanto com a mudança quanto com `tela/servidor.py` e `testes/unidade.py` revertidos. Medido só em Windows 11, com Python 3.13 e Chromium do Playwright._

## 4. O que fica aberto

- [ ] **4.1 `openspec validate ponta-da-seta-nomeia-a-peca`.** _Falta: o CLI do openspec não está nesta máquina (`command -v openspec` não devolve nada). O formato foi escrito espelhando `fidelidade-da-ida-e-volta`, que é a change que criou a capacidade `ida-e-volta`._
- [ ] **4.2 O portão de navegador, que é a task 4.1 de `o-caminho-do-zero`.** _Falta: o último passo do `testes/prova-do-zero.py` lê `window.__bioma_grafo`, e `grep -rn "__bioma_grafo" tela/app/src tela/servidor.py` só acha a leitura, nunca a escrita. O passo cai no botão `Take to my machine`, que a gaveta de código cobre, e a prova morre no timeout do clique. Consertar isso é subject próprio: ou o app publica o grafo, ou a prova fecha a gaveta e dirige o diálogo de destino._
