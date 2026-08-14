## Why

A promessa da ferramenta é que a árvore desenhada vira infraestrutura e que
rodar de novo devolve a mesma coisa. Medido na primeira instalação real, o
código é reprodutível e o **procedimento** não: a fundação de uma instituição
subiu com onze passos que não passam pelo comando.

O que a medição achou, e nenhum deles é surpresa de execução:

1. **Pré-requisito humano não é declarado.** Quota de contas, endereços de
   e-mail com entrega provada e troca do root da conta de management são
   condições sem as quais a fase falha no meio. O comando começa mesmo assim, e
   descobre no apply.

2. **Passo à mão não foi previsto como parâmetro.** Virar uma flag depois que o
   Control Tower fica `ACTIVE`, colher os números das contas para o ambiente,
   remover as VPCs default, emitir o certificado da VPN de acesso. Cada um mora
   num runbook e nenhum é entrada do comando.

3. **Valor que a própria árvore produz é pedido a quem opera.** Três ARNs de
   chave e um de role travam duas células. O organismo que emite dois deles já
   existe no catálogo: o que falta é o fio.

4. **A ordem depende de efeito colateral.** A escolha da role de execução lê o
   diário de bordo procurando um apply anterior. Ordem derivada de rastro é o
   oposto de migração, e ela quebra em toda conta que ficou fora do passo que
   criou a role.

5. **Célula adiada some.** Quem adia escreve a razão num arquivo de exclusão, e
   o que ela vai travar depois não fica em lugar nenhum. A fila nua, sem o
   arquivo de exclusão, traz de volta a célula que cedeu o serviço para outra.

A referência que o produto deve alcançar tem nome e é conhecida: migração de
banco de dados. Ordem declarada, numerada, com estado registrado e com o que
falta dito antes de começar.

## What Changes

- O comando **exige a declaração** de cada pré-requisito humano antes de tocar
  a nuvem, e diz qual falta, com o dono e o que ele trava.
- Todo passo à mão vira **parâmetro previsto no framework**, com default onde
  couber, perguntado na instalação e cobrado no pré-voo.
- Valor produzido pela árvore vira **dependência entre células**, e sai da lista
  do que alguém preenche.
- A fila vira **migração declarada**: a ordem é dado versionado, cada passo tem
  número e estado, e a role de execução sai da posição declarada, nunca de
  rastro no diário.
- Célula adiada declara **o que ela trava** e é oferecida ao fim da execução,
  em vez de sumir num arquivo de exclusão.

## Capabilities

### New Capabilities

- `prerequisito-declarado`: o que a ferramenta exige por escrito antes de tocar a nuvem.
- `parametro-do-passo-a-mao`: como um passo manual vira entrada do comando.
- `fio-em-vez-de-variavel`: quando um valor é dependência e não pergunta.
- `fila-de-migracao`: a ordem como dado, com número e estado.
- `celula-adiada`: o que uma célula fora da fila declara.

## Impact

- Quem já tem instância instalada precisa declarar os pré-requisitos uma vez;
  sem eles o comando para antes do pré-voo, com a lista do que falta.
- `instalar.py`, `bioma.sh` e `guia.py` são hoje da instância e não do
  framework. A tabela de pré-requisitos e a fila declarada passam a ser do
  framework, e a instância herda. O `design.md` registra por que, e o que foi
  recusado.
- A fila declarada substitui a sequência escrita em shell. Enquanto as duas
  coexistirem, a que vale é a declarada, e o portão de ferramentas confere que
  não divergem.
