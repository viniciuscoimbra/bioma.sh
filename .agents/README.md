# `.agents/` — o harness, sem vendor

O que está aqui não pertence a nenhuma ferramenta de agente. `.claude/` e
`.codex/` são cascas: um arquivo de duas linhas que importa daqui, ou um link
simbólico. Trocar de ferramenta troca a casca, não o harness.

A razão é a de sempre neste repositório: regra escrita em dois lugares diverge
em silêncio, e o dia em que diverge é o dia em que alguém confia na cópia
errada.

```
hooks/      o que roda ANTES de uma ação do agente, e pode recusá-la
scripts/    o que roda no CI e reprova o que já custou caro
fixtures/   os casos que os scripts exercitam
skills/     o procedimento escrito, lido pelas duas ferramentas
```

## Até onde o "sem vendor" vale hoje

| peça | Claude Code | Codex |
|---|---|---|
| `skills/` | link em `.claude/skills/` | link em `.codex/skills/` |
| `scripts/` | chamados no CI e à mão | os mesmos |
| `hooks/guarda.py` | ligado em `.claude/settings.json` | **não ligado** |

O Codex CLI não tem o equivalente de `PreToolUse`. Enquanto não tiver, o portão
de comando vale para quem trabalha pelo Claude Code, e a revisão pelo Codex roda
`-s read-only`, que é o que dispensa o portão do lado dele. Escrito aqui porque
uma revisão de 2026-09-06 apontou, com razão, que a alegação de "sem vendor"
era maior do que o fato.

## O que ele custa

O hook roda antes de CADA comando, e quem paga é quem está trabalhando. Medido
nesta máquina em 2026-09-06:

| comando | custo |
|---|---|
| qualquer um que não casa regra nenhuma | 0,63s |
| `git push` (compila + evals do harness) | 5,7s |

Quase todo o primeiro número é a partida do Python: `python3 -c pass` sozinho
leva 0,53s aqui. Por isso `subprocess` é importado dentro da regra do push, e
não no topo: ele custava 0,2s de todo comando para servir a um só.

Se esse meio segundo passar a incomodar, o conserto é reescrever o hook em algo
que sobe mais rápido, e não afrouxar as regras.

## O que o portão de comando NÃO é

Barreira de segurança. As regras casam grafia, e grafia se troca: `git add
--all` no lugar de `-A`, `command git push` no lugar de `git push`. A mesma
revisão mostrou o contorno de todas elas em uma linha cada, e os contornos
viraram caso. Continuará havendo contorno; o que este portão impede é a mão no
automático, que é o defeito que de fato aconteceu aqui.

## A regra que vale para todo portão daqui

**Portão sem caso é carimbo.** Todo script deste diretório aceita
`--autoteste`, e o autoteste tem duas metades obrigatórias:

1. o caso que ele **recusa**, com a data do erro que o criou
2. o vizinho que ele **deixa passar**

A segunda metade é a que importa. Portão que recusa qualquer coisa parecida
com o erro ensina a desviar dele, e foi assim que o portão de comando da
instância quase recusou o commit que documentava o próprio portão.
