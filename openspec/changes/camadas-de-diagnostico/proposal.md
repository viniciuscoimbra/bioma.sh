## Why

A régua que existia rodava sobre a árvore já escrita, com uma lista plana de
regras, exercitada em dois blocos de um cliente. Teste que só roda no desenho de
alguém prova aquele desenho, e não a ferramenta.

Falta o que um compilador faz: camadas. Cada uma só faz sentido depois que a
anterior fechou, e cada achado tem peso. Elemento solto no canvas é pergunta da
primeira camada, não da última; falta de valor numa ligação é de outra; e o que
impede a entrega precisa se distinguir do que só merece um aviso.

## What Changes

- Quatro camadas, na ordem em que valem: a peça (cada caixa sozinha), o desenho
  (o grafo), a ligação (o que a seta exige) e a saída (a árvore escrita).
- Todo achado tem nível: `erro` impede a entrega, `aviso` deixa passar e fica
  escrito. Peça solta que não guarda conteúdo é erro; peça solta que guarda é
  aviso, porque quem a consome pode nem estar naquele desenho.
- Cada regra é exercitada por desenho sintético, com o caso que ela pega e o
  contra-caso que ela não pode pegar, sem depender de bloco de cliente.
- O portão `camadas` entra em `testes/portoes.sh`.

## Capabilities

### New Capabilities

- `diagnostico-em-camadas`: o que a ferramenta confere antes de deixar a árvore sair.

## Impact

- Desenho com erro deixa de gerar entrega. Hoje nada bloqueava.
- As seis áreas do caso de uso passam sem erro, com avisos que nomeiam o que
  falta responder.
