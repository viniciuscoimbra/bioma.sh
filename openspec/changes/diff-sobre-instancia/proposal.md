## Why

O gerador escreve uma árvore nova. Quem tem instância de pé precisa de outra
resposta: o que este desenho acrescenta, muda e remove no que já existe.

A instância privada de referência tem 211 células. Uma rodada de correção da árvore de
OUs mexeu em contas, caminhos e dependências, e a única forma de saber o que
tinha mudado foi ler o `git diff` linha a linha. A ferramenta que escreveu a
árvore não sabia dizer o que ela mesma faria com a árvore anterior.

Isso também é o que separa o desenho da operação. Hoje o desenho serve para
nascer; para continuar vivo, ele precisa responder pela diferença.

## What Changes

- Um comando compara o desenho com uma árvore existente e responde em três
  listas: o que nasce, o que muda e o que sai.
- O que muda é dito por campo, não por arquivo: `conta`, `ambiente`, `entrada`,
  `dependência`, para que o revisor veja a diferença sem abrir o `.tf`.
- O que sai passa pela trava de durabilidade antes de aparecer como remoção:
  célula permanente que sumiu do desenho vira aviso, e não sugestão de destruir.
- A tela mostra o mesmo resultado ao lado da árvore, quando a pasta de trabalho
  aponta uma instância.

## Capabilities

### New Capabilities

- `diff-sobre-instancia`: o que a ferramenta responde quando a árvore já existe.

## Impact

- Nada muda para quem gera árvore nova: o comando é outro.
- A comparação lê a árvore existente do disco, e não o estado da nuvem. Ela
  responde pela diferença entre desenho e código, não entre código e o que está
  aplicado. Essa segunda pergunta é do `terraform plan`, e a resposta precisa
  dizer isso para não ser confundida com ela.
- Célula que existe no live e não tem origem em desenho nenhum aparece como
  achado, porque é o caso mais comum de instância que envelheceu.
