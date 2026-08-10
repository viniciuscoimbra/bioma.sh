# Design — OU e ambiente no grafo

## A pergunta que decide tudo

Um `.bio` descreve a topologia de um ambiente, ou de todos?

**Escolhido: de todos, com o ambiente como propriedade do nó.** O desenho traz a
topologia uma vez, e cada nó diz em que ambientes ele existe. `msk-cluster`
existe em `nprd` e `prd`; `hub-planos` existe uma vez, porque mora em conta
fundacional.

**Recusado: um `.bio` por ambiente.** Seis áreas vezes três ambientes daria
dezoito projetos para manter em paridade, e a paridade entre ambientes é
exatamente o que o desenho deveria garantir. Divergência entre dev e prd viraria
divergência entre arquivos, que ninguém revisa junto.

**Recusado: ambiente só no nome da conta.** É o que existe hoje, e é o que faz
`barramento-nprd` e `barramento-prd` parecerem duas caixas diferentes quando são
a mesma caixa em dois ambientes.

## Como OU e ambiente chegam ao nó

Três fontes, nesta ordem:

1. **A zona já diz.** `Platform · Barramento` e `Workloads · Core Bancario`
   carregam a OU no próprio texto, e é assim que a arquitetura de referência
   escreve desde a correção da árvore. O tradutor separa no `·`.
2. **O mapa da instância.** Quando existe um `contas.hcl` importado, a família
   da conta dá a OU e o sufixo dá o ambiente. É a mesma fonte de
   `contas-do-live`, e reusá-la evita uma terceira lista.
3. **A pessoa responde.** Sem as duas primeiras, a ficha pergunta, em português,
   uma pergunta por peça. O que não se responde fica marcado, e não vira
   suposição.

## A natureza da OU decide quantas células nascem

| natureza | ambientes | exemplo |
|---|---|---|
| workload | `dev`, `hml`, `prd` | Core Bancario |
| capacidade de plataforma | `nprd`, `prd` | Barramento |
| fundacional | nenhum | network, log-archive |
| agrupadora | não recebe conta | Platform, Credito, Canais |

A tabela é o que a instância privada de referência aprovou, e vale como padrão. Ela é
sobrescrita por instância, porque a quantidade de ambientes é decisão de quem
opera.

## O `.bio` de hoje, depois da mudança

**Escolhido: abrir e marcar.** Projeto sem `ou` e sem `ambiente` abre, e cada nó
sem as duas propriedades aparece com a marca de pendente, do mesmo jeito que uma
ficha sem resposta. A tela diz quantos nós estão assim.

**Recusado: assumir ambiente único.** Assumir é decidir em silêncio, e o desenho
sairia afirmando algo que ninguém disse. Um projeto antigo aberto e regravado
passaria a mentir sem que nada avisasse.

**Recusado: recusar o arquivo.** Quem tem projeto salvo perderia o trabalho por
uma mudança de esquema.

## Migração da árvore de referência

A árvore gerada muda para quem usa multiplicidade por ambiente. O portão
`arvore` compara com a referência versionada, então a referência é refeita no
mesmo commit, à vista do revisor, com o diff mostrando célula que nasceu e
célula que mudou de caminho.

## O que fica de fora

Região não entra como dimensão agora. Ela já existe na configuração do projeto e
não muda a contagem de células, que é o que esta change resolve. Multi-região
por nó é pergunta própria, e a resposta dela depende de DR, que é decisão de
arquitetura e não de desenho.
