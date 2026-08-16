## Why

Quem desenha infraestrutura não sabe o que é `ami-031a45ebb21af623a`, e não
deveria precisar saber. Hoje o identificador de imagem entra à mão no ambiente
da instância, e as duas alternativas que existem são ruins:

- **família resolvida em tempo de apply** (`data "aws_ami"` com filtro de nome):
  a máquina renasce com imagem nova sem ninguém decidir isso, e o defeito
  aparece meses depois, num apply de rotina.
- **identificador digitado**: quem opera precisa saber a sintaxe de busca da
  AWS, o identificador vale só numa região, e nada registra por que aquela
  imagem foi escolhida.

Uma instalação real subiu quatro máquinas de fornecedor assim, e as três
imagens (uma Linux, duas Windows) foram descobertas por consulta manual à API,
com o resultado colado no ambiente.

## What Changes

- Quem desenha escolhe a imagem por **nome de catálogo** (a distribuição e a
  versão), e não por identificador.
- A ferramenta resolve o nome para um identificador **no momento do desenho**,
  registra a escolha com data e região, e é esse identificador que a receita
  usa. Resolver no desenho e não no apply é o que impede a máquina renascer
  diferente.
- A tela mostra a escolha e diz quando ela envelheceu, com o que a substituiria.

## Capabilities

### New Capabilities

- `imagem-de-maquina`: como um projeto escolhe, registra e envelhece a imagem de uma máquina.

## Impact

- O `.bio` passa a carregar a escolha de imagem; o gerador emite o
  identificador registrado; a peça de servidor deixa de receber `ami` cru da
  instância.
- Instalação existente continua funcionando: identificador informado à mão
  segue valendo, e vira a forma de resgate.
