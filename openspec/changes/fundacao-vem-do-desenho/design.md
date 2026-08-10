# Design — a fundação vem do desenho

## O que já existe, medido

Rodado em 2026-08-10, `gerar_iac.py` contra uma proposta de três peças de
fundação:

| Peça no desenho | O que o gerador escreveu | O que o catálogo tem |
|---|---|---|
| AWS Organizations | `aws_organizations_organization` vazio + OU | `organizacao`: `feature_set = ALL`, 3 policy types, 9 principals, `prevent_destroy` |
| AWS Organizations OU | `aws_organizations_organization` vazio + OU | `arvore-ous` compondo `ou-registrada`, com `aws_controltower_baseline` |
| AWS Organizations Account | `aws_organizations_organization` vazio + OU | `conta-governada` compondo `conta`, com tags, contatos e gate de enrollment |

A coluna do meio é a mesma nas três linhas. É o sintoma: o gerador casa o termo
`organizations` e devolve sempre o mesmo par de recursos.

## D1. Como o gerador sabe que a peça é de fundação

**Escolhido: pela tabela, não pela natureza da OU.** Uma entrada na tabela de
fundação diz que o termo resolve para um organismo do catálogo, e nomeia qual.
Peça sem entrada não é de fundação.

Recusado: usar `natureza_ou: fundacional` do nó. Esse campo diz onde a peça
**mora**, não o que ela **é**. Um bucket de log mora em OU fundacional e continua
sendo um átomo. Usar o campo errado traria bucket para dentro do caminho de
composição.

Recusado: marcar o organismo do catálogo com uma flag e varrer o catálogo. O
catálogo é dado de entrada da instância e pode ser trocado; a tabela é o lugar
onde o AGENTS.md manda a decisão morar.

## D2. Onde a tabela mora

**Escolhido: `ferramentas/mapa_fundacao.json`, arquivo novo.** Ela mapeia termo
para organismo, não termo para recurso, que é uma forma diferente da de
`mapa_recursos.json`. Misturar as duas obrigaria a inventar um campo para
distinguir as linhas.

A tabela é validada contra o esquema do provider da mesma forma que a outra: o
organismo apontado precisa existir em `catalogo/`, e os recursos que ele declara
precisam existir em `ferramentas/esquema-aws.json`.

**A divergência atual é resolvida aqui.** `ler_diagrama.py` diz que
`organizations` é `aws_organizations_organization` e `tela/icones-aws.json` diz
que é `aws_organizations_account`. Nenhuma das duas está certa sozinha: o termo é
ambíguo e precisa de três entradas distintas (`organizations`,
`organizations ou`, `organizations account`). O termo cru `organizations`, sem
qualificador, resolve para a Organization e o ícone acompanha.

## D3. O que acontece com a segunda Organization

**Escolhido: recusar a tradução inteira, nomeando as duas peças.** É a mesma
resposta que `contas_do_live.py` já dá para número de conta repetido: recusa o
arquivo todo e nomeia os dois apelidos. Uma Organization por conta de gerência é
regra da AWS, não preferência.

Recusado: escrever as duas e marcar pendente. Pendente é para o que a ferramenta
não sabe. Aqui ela sabe, e sabe que está errado.

Recusado: escolher a primeira e descartar a segunda. Descartar peça desenhada em
silêncio é o oposto do que o repositório promete.

## D4. Como a célula aponta para o organismo

**Escolhido: `source` apontando para o organismo do catálogo, com os inputs
vindos do `variables.tf` dele.**

Isso é trabalho novo, e não redirecionamento. `gerar_iac.py` hoje só **escreve**
`variables.tf` (`variables_tf()` na linha 497, chamada na 1277); ele nunca lê um.
O bloco `inputs` que sai com `PREENCHER` e a pergunta em português vem do esquema
que ele mesmo acabou de montar, não de parse. Compor organismo escrito à mão
exige ler `variables.tf` de terceiro pela primeira vez: nome, tipo,
obrigatoriedade e `description`.

O gerador **não escreve** dentro de `catalogo/organismos/fundacao/` na árvore de
saída. Ele copia o organismo existente, sem reescrever. Isso mata o defeito do
stub por cima da receita boa.

## O que fica de fora

`landing-zone` não entra. O interior dela é módulo de terceiro e a escolha entre
o da Gruntwork e o `mcaf-landing-zone` é decisão humana registrada em
`fundacao-e-o-aft/design.md:74-75`. A árvore gerada nomeia a falta em vez de
preencher.

A migração de quem já aplicou o stub não entra. `prevent_destroy` no organismo
bom e a ausência dele no stub fazem dessa migração uma operação sobre estado de
produção, que é decisão de quem opera.
