---
name: ciclo-de-sessao
description: Abrir, escolher, verificar e fechar uma sessão de trabalho no bioma.sh. Use ao começar a trabalhar no repositório, antes de qualquer PR, e ao retomar trabalho de outra sessão.
metadata:
  version: "1.0"
---

# Ciclo de sessão

## Abrir

- [ ] `git status` limpo, ou o que está sujo é conhecido e declarado.
- [ ] `python3 .agents/scripts/placar_do_harness.py` — o harness está inteiro.
- [ ] `bash testes/portoes.sh` — o estado de partida passa. Portão que já estava
      vermelho antes da sua mudança não é seu, e descobrir isso no fim custa a
      sessão inteira.

## Escolher

Uma frente por vez, uma branch, um PR. `AGENTS.md` diz que o trabalho combinado
mora em `openspec/changes/<nome>/tasks.md`: se o que você vai fazer não está lá
e muda comportamento, a primeira tarefa é escrever a proposta.

## Verificar

A tabela de `AGENTS.md` diz qual prova fecha cada tipo de mudança:

| mudou | prova |
|---|---|
| tela | navegador, o clique dado, o resultado medido, e a foto **olhada** |
| gerador ou tradutor | a árvore gerada, com o trecho que mudou |
| servidor | a rota chamada e a resposta |
| texto de interface | a frase nova em contexto, nas duas línguas |

Verificação vale num worktree **só com o que está commitado**. Arquivo untracked
cega o portão: ele passa na sua máquina e reprova no CI.

Mudança em `ferramentas/`, `tela/`, `catalogo/` ou `.agents/` fecha com a skill
`verificacao-cruzada`.

## Fechar

- [ ] `bash testes/portoes.sh` verde
- [ ] `python3 .agents/scripts/evals_do_harness.py` verde
- [ ] commit com assunto em português, imperativo, dizendo o efeito; corpo com o
      que estava errado antes e a prova
- [ ] o que ficou por fazer entra no `tasks.md`, não na memória

## Verificação

Feito quando os dois comandos acima saem verdes num worktree só-commitado, e o
`tasks.md` da change reflete o que de fato fechou.
