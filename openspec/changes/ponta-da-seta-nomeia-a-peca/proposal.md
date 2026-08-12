## Why

Desenho montado na tela não vira árvore. Qualquer um: duas peças e uma seta
bastam.

A especificação que a tela escreve nomeia a mesma peça de dois jeitos. A tabela
de serviços usa `servico` (`Amazon CloudFront`) e a tabela de arestas usa o `id`
do nó (`cloudfront`). O tradutor casa a ponta da seta contra a coluna de
serviço, e o id não existe naquela tabela: toda ponta fica sem dono, toda peça
sai solta e o diagnóstico barra a entrega.

Medido num `.bio` de 14 peças e 13 setas, salvo pela própria tela: **11 erros de
`peça solta`, 26 avisos de `ponta fora do desenho` e `pode_sair: false`**. O
`/materializar` recusa gravar. As 13 relações estão na proposta o tempo todo,
apontando ids que existem no grafo.

O caminho do `.md` escrito à mão não sofre disso, porque lá a tabela de arestas
já vem com o nome do serviço. É por isso que o defeito atravessou a change
`fidelidade-da-ida-e-volta`, que provou a fidelidade no sentido `.md → .bio` e
nunca no sentido `desenho → árvore`.

Nenhum portão passa por essa função. O `arvore` traduz o `.md` direto, sem
tocar na especificação que a tela escreve. O portão de navegador que pegaria é
a task 4.1 de `o-caminho-do-zero`, que continua aberta, e a nota dela já disse o
caminho: o portão `unidade` é o barato que pega o que o e2e não pega.

## What Changes

- `especificacao()` resolve o `id` do nó para o `servico` dele ao escrever a
  tabela de arestas. Ponta que não é nó do desenho (outro bloco, sistema de
  fora, tópico) continua saindo como o texto que veio, que é o que `de_classe`
  e `para_classe` já descrevem.
- `testes/unidade.py` ganha `testa_ponta_da_aresta`, que monta o grafo do jeito
  que a tela monta, escreve a especificação, traduz e roda o mesmo diagnóstico
  que a tela roda antes de deixar gravar.

## Capabilities

### Modified Capabilities

- `ida-e-volta`: a ponta da aresta na especificação escrita pela tela passa a
  nomear a peça, e não o id dela.

## Impact

- **O que quebra para quem já usa.** A especificação exportada muda de texto na
  coluna de origem e destino: onde saía `cloudfront`, sai `Amazon CloudFront`.
  Quem lê esse `.md` por script e casa por id precisa casar por serviço, que é
  como a tabela de serviços do mesmo documento sempre nomeou.
- O `.bio` não muda: `de` e `para` continuam guardando id, como a spec de
  `ida-e-volta` exige.
- A árvore gerada a partir de `.md` não muda; o portão `arvore` não se move.
- A árvore gerada a partir do desenho muda de "não sai" para "sai".
- Fica aberta a task 4.1 de `o-caminho-do-zero`, e agora com o motivo medido: o
  último passo do `testes/prova-do-zero.py` lê `window.__bioma_grafo`, e nenhum
  arquivo do app escreve essa variável. O passo cai no botão da tela, que a
  gaveta de código cobre, e a prova morre no timeout do clique. Enquanto isso
  não for consertado, o portão de navegador não fecha, e é por isso que esta
  change para no portão `unidade`.
