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

## D5. Variável que a célula de cima publica não vira pergunta

**Escolhido: `dependency` entre as células de fundação, e a tabela dizendo qual
variável casa com qual saída.**

`arvore-ous/variables.tf:1` pede `root_id`, que é o `output "root_id"` de
`organizacao`. `conta-governada/variables.tf:3` pede `ou_id`, que é chave do
`output "ous"` de `arvore-ous`. Nenhum dos dois existe antes do apply, e nenhum
é escolha de quem opera: os dois saem do estado da célula anterior.

A forma que a tabela sabe dizer é `variável ← organismo.saída`, e são essas
duas. `politicas-scp` precisa de uma terceira forma e **fica de fora**: a
variável dele é `politicas`, um `map(object({...}))` cujos campos `canario` e
`producao` são `list(string)` de ids de OU. Ligar isso é escolher chaves do mapa
`ous` e montar uma lista dentro de campo aninhado, que a forma acima não
expressa. Declarar `politicas-scp` na mesma tabela esconderia essa diferença até
a hora de implementar.

Isso **estreita D4**. Ler o `variables.tf` devolve toda variável do organismo,
sem noção de qual delas uma irmã publica; sozinho, esse parse transformaria
`root_id` e `ou_id` em `PREENCHER`. A tabela de fundação passa a declarar, por
organismo, a variável, o organismo que publica e o nome da saída. O que a tabela
não casar continua virando pergunta.

Recusado: perguntar o id e deixar quem opera colar. O id da raiz da Organization
só existe depois do apply de `organizacao`; a pergunta obrigaria a rodar,
copiar da saída e voltar ao arquivo, três vezes, e é justamente o passo que
`dependency` remove.

Recusado: `terraform_remote_state`. A leitura remota existe pelo motivo escrito
em `gerar_iac.py:559-566`: o plano de uma PR não pode ter permissão de mexer na
base permanente. A fundação **é** a base, e a ordem entre as células é o que
precisa ficar escrita, que é o que `dependency` faz e a leitura não faz.

## D6. Quem exige apply serial diz isso na célula

**Escolhido: `extra_arguments` com `-parallelism=1` no `terragrunt.hcl` gerado,
a partir de um campo no contrato do organismo.**

`arvore-ous/main.tf:2` e as `premissas` do `contrato.json` dele exigem
`parallelism 1`, porque o registro de baseline do Control Tower roda uma OU por
vez. Hoje essa exigência é frase em texto livre e não chega a lugar nenhum. O
campo passa a ser `apply_serial: true`, lido pelo gerador.

O `--parallelism` do terragrunt é unidade em paralelo. As OUs são `for_each`
dentro de uma unidade só, e quem as serializa é o `-parallelism` do terraform.
São duas flags de nome parecido e efeito diferente, e é por isso que a exigência
passou despercebida.

Recusado: a flag no `bioma.sh`. A receita impressa em `bioma.sh:378` sai com
`--parallelism 4` e nada desce `-parallelism=1`. Corrigir só ali deixaria de
fora quem roda o terragrunt na mão, que é o caminho de `docs/rodar-na-mao.md`, e
deixaria de fora qualquer esteira que opere a árvore sem o `bioma.sh`. A
restrição é do organismo, então ela viaja com a célula.

## O que fica de fora

`landing-zone` não entra. O interior dela é módulo de terceiro e a escolha entre
o da Gruntwork e o `mcaf-landing-zone` é decisão humana registrada em
`fundacao-e-o-aft/design.md:74-75`. A árvore gerada nomeia a falta em vez de
preencher.

A migração de quem já aplicou o stub não entra. `prevent_destroy` no organismo
bom e a ausência dele no stub fazem dessa migração uma operação sobre estado de
produção, que é decisão de quem opera.

**O descasamento de caminhos entre o `bioma.sh` e o gerador não entra, e fica
reportado aqui.** Medido em 2026-08-10 contra a árvore do desenho de referência:
o gerador escreve `live/<trilho>/<alcance>/<nome>` (`gerar_iac.py:10`) e as
fases 2 a 6 procuram `fundacao/00-organizacao`, `plataforma/rede/org`,
`plataforma/seguranca`, `core-banking/dev/base` (`bioma.sh:443-497`). Nenhum
desses caminhos existe numa árvore gerada. `roda_area` registra `inexistente` e
volta calado (`bioma.sh:353`), então `./bioma.sh --perfil sandbox` não imprime
receita nenhuma para as fases 3 a 6, e a fase 2 morre no gate de baseline antes
disso. Só `--area live/<caminho>` funciona hoje.

O mesmo descasamento cala dois filtros. `excluir_por_perfil.py:28` e
`bioma.sh:340` montam o caminho do contrato como `<repositório>/infra/catalogo/`,
fixo. Numa árvore gerada esse caminho não existe, então a exclusão por perfil e a
recusa por durabilidade não acham contrato nenhum e não excluem nada, sem dizer.

Isso vale para a árvore inteira e não só para a fundação, e a decisão entre
ensinar o vocabulário do `live/` ao `bioma.sh` ou mudar o que o gerador escreve
muda a saída de todas as fases. É change própria. Enquanto ela não existe,
`docs/rodar-na-mao.md` documenta o caminho que funciona.
