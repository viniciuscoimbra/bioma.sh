# Design: acesso de fora ao barramento

## Decisão 1: lista por principal, e não lista maior

A receita tinha duas listas de principal, cada uma com um escopo só. O custo
disso aparece no que cada principal recebe sem precisar: um consumidor que não é
conector herdava `WriteData` e `CreateTopic` para poder ler, e dois produtores de
tópicos diferentes passavam a escrever um no tópico do outro.

**A. Alargar as listas antigas.** Acrescentar `topicos_dos_consumidores` e um par
de listas por tipo de principal novo. Recusada: o escopo continua dividido entre
todos os principais da lista, então o segundo produtor segue alcançando o tópico
do primeiro. A receita fica maior e a mistura permanece.

**B. Uma célula por principal.** Recusada por causa do recurso: a política é do
cluster e é uma só. `PutClusterPolicy` substitui a política inteira, então a
segunda célula apagaria a primeira, e nenhuma das duas acusaria isso no plano.
O contrato da ligação já declara N:N pela mesma razão.

**C. Mapa de entradas, cada uma com o escopo dela.** A entrada junta os
principais que alcançam os mesmos tópicos e grupos, e gera os statements com
esse escopo.

**Decidido: C**, em 2026-09-11. É a única das três em que o escopo de um
principal não alcança o outro.

O leitor conecta com `Connect` e `DescribeCluster`, sem `WriteDataIdempotently`:
a ação só serve a quem escreve, e ele não recebe `WriteData` em tópico nenhum.
Leitor sem grupo declarado não gera o statement de coordenação, porque quem lê
por partição atribuída não entra em grupo, e statement sem recurso não é política
válida.

## Decisão 2: o Sid vem do nome da entrada

**A. Sid por posição.** `Leitores1Conectam`, `Leitores2Conectam`. Recusada:
quando uma entrada sai, os Sids das seguintes andam, e a política viva deixa de
poder ser casada com a planejada pela chave.

**B. Sid fixo por tipo.** Um `LeitoresConectam` com todos os leitores dentro.
Recusada: volta ao escopo compartilhado da decisão 1.

**C. Nome da entrada como prefixo**, com `Conectam`, `Leem`, `Coordenam` e
`Escrevem` como sufixos.

**Decidido: C**, em 2026-09-11. O que ele comprou é concreto. Numa instalação, a
política viva tinha sido editada no console, e aplicar a célula por cima
substituiria a política inteira, com consumo ativo em jogo. Com o Sid vindo do
nome, as entradas foram nomeadas como os statements que estavam na nuvem, e as
duas políticas foram comparadas statement por statement antes do apply: sobraram
três diferenças, declaradas e aceitas antes de aplicar.

O custo é que o nome vira interface. O Sid da política da AWS aceita letra e
número, o nome repetido gera dois statements com o mesmo Sid, e um nome igual ao
prefixo que a receita já usa (`ConectoresDeOutraConta`, `ProdutoresDeOutraConta`)
colide com o statement que ela mesma gera. Daí as recusas da decisão 3.

## Decisão 3: onde cada recusa mora

`validation` de variável no Terraform enxerga só a própria variável. A colisão de
nome entre `leitores` e `escritores` depende das duas, então ela não cabe ali:
é `precondition` do recurso, que lê os Sids já montados e devolve a lista deles
no erro.

O que depende de uma variável só fica na `validation`, que reprova mais cedo e
aponta o campo: caractere fora de letra e número, nome igual a prefixo da
receita, e entrada sem principal ou sem tópico, que geraria statement sem
principal ou sem recurso.

As duas recusas acontecem no plano. A alternativa era descobrir no
`PutClusterPolicy`, com a política já substituída no caminho.

## Decisão 4: a faixa 14001-14100, e o piso de prefixo

A conexão multi-VPC atende cada broker numa porta própria, a partir de 14001.
Abrir porta a porta exigiria saber quantos brokers o cluster tem e mexer na regra
quando ele crescer, então a regra abre a faixa até 14100. Reaproveitar a 9098 foi
recusado por medição: é o caminho do conector gerenciado, e o bootstrap da
conexão privada fica em timeout nela.

O piso de prefixo `/16` é o mesmo de `origens_do_endpoint` na `vpc-dominio`.
Prefixo mais curto abre os brokers a uma supernet inteira, e a origem aqui é a
VPC de uma conta que não está na organização.
