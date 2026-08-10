## Why

O produto existe para uma pessoa que não escreve Terraform desenhar
infraestrutura e receber estrutura válida. Esse caminho nunca tinha sido
exercido de ponta a ponta. Exercido em 2026-08-09, clicando, do canvas vazio até
o zip na máquina, ele passa em seis dos oito passos e falha nos dois que
importam.

**O que funciona, medido no navegador:** a tela abre vazia; começar do zero abre
o assistente e ele é pulável; a busca acha `s3` e `lambda` e põe as peças no
canvas com a conta e o tecido decididos; ligar peça em peça desenha a seta; a
gaveta mostra 13 arquivos; clicar no arquivo mostra o código; o botão entrega um
zip de 6.687 bytes com a árvore inteira.

**O que não funciona, medido no que saiu do zip:**

1. **A seta desenhada não vira dependência.** Liguei o bucket na função e o
   `terragrunt.hcl` da função saiu sem um `dependency` sequer. O desenho registra
   a ligação e a estrutura não a carrega, então a ordem de criação não existe.

2. **O recurso sai inválido.** `terraform validate` no organismo gerado da função
   devolve três erros: falta `filename`, `image_uri` ou `s3_bucket`, e
   `function_name` referencia o próprio recurso
   (`function_name = aws_lambda_function.lambda_function.function_name`). O
   bucket, no mesmo zip, valida sem erro.

A causa do segundo tem nome e não é adivinhação: o esquema do provider marca
como obrigatórios apenas `function_name` e `role`; a exigência de um entre
`filename`, `image_uri` e `s3_bucket` é validação cruzada do provider e não
aparece no JSON do esquema. O `README.md` já promete o comportamento certo para
esse caso: "Onde o provider exige combinação que o esquema não declara, ele roda
a validação e escreve a reclamação dentro do arquivo, em vez de adivinhar". A
tela não faz isso: ela chama `gerar_iac.py` com `--forcar` e sem `--conferir`
([tela/servidor.py:246](../../tela/servidor.py)).

A auto-referência é defeito próprio do gerador, sem relação com o esquema.

## What Changes

- A aresta do desenho vira `dependency` na célula de destino, com o output que
  ela consome, e a ordem de criação passa a existir na estrutura.
- A tela gera com conferência: o que o provider recusa aparece escrito dentro do
  arquivo e na ficha, em vez de sair silenciosamente inválido.
- Atributo que referencia o próprio recurso deixa de ser emitido.
- O caminho do zero vira portão: um teste de navegador que monta do zero, baixa
  e roda `terraform validate` no que saiu. Enquanto ele não passar, o produto
  não cumpre o que promete.

## Capabilities

### New Capabilities

- `caminho-do-zero`: o que a ferramenta garante para quem desenha sem partir de documento nenhum.

## Impact

- Quem já gera árvore hoje passa a receber células com `dependency` onde antes
  não havia, e a árvore de referência dos portões muda no mesmo commit.
- A geração fica mais lenta, porque passa a rodar `terraform validate`. É o
  preço de não entregar arquivo que não compila.
