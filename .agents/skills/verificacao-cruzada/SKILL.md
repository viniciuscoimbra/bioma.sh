---
name: verificacao-cruzada
description: Revisão independente Claude↔Codex. Quem escreveu não valida o próprio trabalho; um revisor de outro fornecedor reprova. Use antes de mergear mudança em ferramentas/, tela/, no catálogo ou no próprio harness, e sempre que a conclusão for cara de desfazer.
metadata:
  version: "1.0"
---

# Verificação cruzada (Claude ↔ Codex)

Quem implementou não valida o próprio trabalho. Modelos diferentes erram
diferente, e é a divergência entre eles que produz um "não" em que dá para
confiar. Um "sim" do próprio autor não é evidência de nada: ele testa o que
pensou, e o defeito mora no que não pensou.

Este repositório tem o caso: quatro medições publicadas nesta sessão, refeitas
por um segundo parser, mudaram de número em cinco pontos, e uma delas (a queda
do `get_env` contada como resposta de gente) errava por 382 valores.

## Quando usar

- Mudança em `ferramentas/`, `tela/`, `catalogo/` ou no próprio `.agents/`
- Qualquer conclusão numérica que vá para relatório ou para decisão
- Antes de mergear o que é caro de desfazer

**Quando não usar:** correção mecânica, renomeação, texto. Cruzar vendor dobra
o custo; gastar onde não muda o veredito ensina a ignorar o veredito.

## Processo

1. **Commite.** O revisor lê o disco, não a sua intenção.
2. **Rode o Codex, só leitura, apontado para o worktree certo:**
   ```
   nohup codex exec -s read-only --skip-git-repo-check \
     -C <raiz-do-worktree> "$(cat <prompt.md>)" > r1.log 2>&1 &
   ```
3. **Espere:** `until ! pgrep -f "codex exec" >/dev/null; do sleep 20; done`
4. **Leia o veredito.** Furo apontado vira correção, e a correção volta para o
   Codex: *"os furos X e Y foram resolvidos? sobrou contradição?"*
5. **Até três rodadas.** Sem convergir na terceira, para e leva ao humano. Loop
   que não converge não vira loop mais longo.

## O prompt

Curto, cético e com pedido de severidade. Pergunte **como você sabe**, não
**o que você acha**. Peça o comando e a saída ao lado de cada afirmação: sem
isso a resposta é opinião com cara de auditoria.

Liste as afirmações a conferir uma por uma, numeradas, e peça
`CONFIRMA / REFUTA / NÃO DÁ PARA DECIDIR` em cada. Revisor sem lista responde
sobre o que ele achou interessante, e o que você precisa é do que ele achou
errado.

## Armadilhas

- **`-s read-only`.** O revisor lê e não escreve.
- **`-C` aponta para a raiz do trabalho.** Apontado para o diretório pai, ele
  vagueia por repositórios vizinhos e gasta a rodada lendo o que não é o
  assunto (medido nesta sessão: 200 KB de log antes do primeiro achado).
- **Decisão fechada varre todas as ocorrências.** O revisor cruza seções e
  documentos: fechar numa e deixar noutra vira contradição apontada.
- **Rode em segundo plano.** A rodada leva minutos.

## Verificação

Feito quando o Codex diz "limpo", ou quando o furo residual está registrado por
escrito com a razão de ter sido aceito. As rodadas ficam visíveis: um commit por
correção, e o log de cada rodada guardado fora do repositório.
