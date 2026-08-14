# Decisões

## Onde mora a tabela de pré-requisitos

`instalar.py` já tem a tabela do que se pergunta (`PERGUNTAS`) e o conjunto do
que não fica para depois (`OBRIGATORIAS`). É o lugar natural, e a decisão é
estendê-la em vez de criar um arquivo paralelo de pré-requisitos.

O que muda de dono: `instalar.py`, `guia.py` e `bioma.sh` são hoje da instância
e não constam do manifesto do framework. Isso significa que cada instalação
inventa as próprias perguntas, e o que uma aprendeu não chega às outras.
A tabela passa a ser do framework, e a instância acrescenta as perguntas dela.

**Recusado: um `prerequisitos.json` separado.** Duas listas do que o operador
precisa fornecer divergem na primeira semana, e o pré-voo teria que cobrar as
duas. A diferença entre "um ARN" e "a confirmação de que a quota subiu" é o
tipo do valor, não o lugar dele.

## O que é declaração e o que é valor

Pré-requisito humano não tem valor útil: ninguém consome "a quota é 60". O que
o comando precisa é a afirmação de que aconteceu, com data e com quem. A
resposta é uma data no formato `AAAA-MM-DD`, e o pré-voo a exibe.

**Recusado: checar na AWS em vez de perguntar.** A quota dá para ler
(`service-quotas get-service-quota`), mas a prova de entrega de nove e-mails e a
troca do root da management não. Metade automática e metade declarada ensina
que a lista é opcional. A leitura automática entra depois, como confirmação da
declaração, e nunca no lugar dela.

## A fila como dado

Hoje a ordem das seis fases é uma sequência de blocos `if` em shell, com o
caminho de cada área escrito dentro. Ela funciona e não se lê: não dá para
listar, versionar nem conferir se o que rodou foi o que estava declarado.

A fila vira dado: cada passo com número estável, título, as áreas que ele
aplica, o que ele exige antes e o que ele libera depois. O `bioma.sh` passa a
percorrer o dado.

**Recusado: deixar o terragrunt resolver tudo.** O terragrunt resolve a ordem
DENTRO de uma área, pelas dependências. Entre áreas existem cortes que nenhuma
dependência expressa: a conta não se apaga, e por isso a fase que a cria termina
com uma conferência humana antes da próxima. Migração tem passo, e passo tem
fim.

## A role de execução sai da posição

`esteira_pronta()` procura no diário de bordo qualquer apply de esteira que
tenha dado certo, e a partir daí todo comando assume a role que a esteira cria.
Isso é ordem derivada de rastro: a role só existe nas contas onde a célula de
OIDC rodou, e a fila nua atravessa contas onde ela não rodou.

Com a fila declarada, o passo diz qual role ele usa. O que criou a role declara
que a criou; o que vem depois declara que a usa. O diário registra, e não decide.

## Adiada e cedida são o mesmo campo

`celulas-que-ficam-fora.txt` diz a razão de cada exclusão. A marca
`# cedeu para: <caminho>` diz que uma célula passou o serviço a outra. As duas
respondem "por que esta célula não roda", e a diferença é se existe volta.

Um campo só, na própria célula: `adiada` tem volta e declara o que trava;
`cedeu` não tem volta e declara para quem. O arquivo de exclusão deixa de ser
entrada escrita à mão e passa a ser gerado da árvore.

**Recusado: manter o arquivo como fonte.** Arquivo de exclusão separado da
célula é combinação que envelhece: a célula muda de nome e a exclusão continua
apontando o nome velho, sem erro.
