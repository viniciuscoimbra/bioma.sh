## Why

O nó do desenho tem `zona` e `conta`, e nada mais sobre onde ele mora. Faltam as
duas coisas que a instância usa todo dia para decidir onde uma célula roda: a
unidade organizacional e o ambiente.

**A OU decide onde a conta nasce e qual guardrail ela herda.** A árvore de uma
instância real tem OU agrupadora, OU de capacidade e OU de workload, e a
diferença entre elas é a decisão mais cara da fundação. O desenho não representa
nada disso, então a decisão que mais custa é a única que não se desenha.

**Ambiente não é dimensão do grafo.** Toda topologia se lê dentro de um
ambiente, e a regra de conta muda por natureza: workload tem três contas, dev,
hml e prd; capacidade de plataforma tem duas, nprd e prd; conta fundacional não
tem ambiente nenhum. Hoje um `.bio` descreve a topologia uma vez e não diz
quantas vezes ela existe, então o mesmo desenho serve para uma conta e para
três, sem que ninguém veja a diferença.

As duas faltas se pagam juntas porque são a mesma pergunta: onde esta peça mora.
Separá-las obrigaria a mexer no esquema do nó duas vezes.

## What Changes

- O nó ganha `ou` e `ambiente`, e a proposta ganha a árvore de OUs da instância
  como estrutura própria, não como texto de zona.
- O tradutor deriva OU e ambiente da zona quando ela já os diz (`Platform ·
  Barramento`, `Workloads · Core Bancario`), e pergunta quando não diz.
- A regra de conta por natureza vira coisa declarada, não convenção: OU de
  workload gera três células, OU de capacidade gera duas, conta fundacional
  gera uma.
- A tela mostra ambiente como eixo do desenho, e não como sufixo de nome.

## Capabilities

### New Capabilities

- `dimensoes-do-desenho`: o que a ferramenta garante sobre OU e ambiente.

## Impact

**Quebra o que já existe, e é por isso que esta change é proposta antes de ser
código.** Todo `.bio` salvo hoje descreve nó sem `ou` e sem `ambiente`. Abrir um
desses depois da mudança precisa de uma decisão: assumir ambiente único, ou
marcar o projeto como incompleto e perguntar. As duas saídas mudam o que um
`.bio` significa.

A árvore gerada muda para quem usa multiplicidade por ambiente, porque o número
de células passa a sair da natureza da OU. A árvore de referência dos portões
precisa ser refeita no mesmo commit.

O `traduzir_bloco.py` ganha um mapa de zona para OU. Zona que o mapa não conhece
continua virando trilho pelo nome, como hoje, mas passa a sair marcada como OU
por confirmar, em vez de silenciosamente sem OU.
