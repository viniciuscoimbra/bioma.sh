# Tarefas

- [x] A régua mede byte, e não semelhança de linha
      `ida_e_volta.py` na árvore da instância: 363 idênticas, 53 diferentes,
      0 longe, de 416. A régua antiga (>=98% de linha) dizia 397.
      Commit 82872aa.

- [x] `trilho` vira `dominio`, chave e não valor
      Mesmos 363 antes e depois, que é o que se espera de troca que não toca
      valor. `bio_ida_e_volta` ganhou o caso do `.bio` antigo. Commit 2679a77.

- [x] A aba lê `pagina`; `fase` vira o passo do deploy
      No navegador: 10 abas ("Todas as Páginas" e os 9 blocos), fundação com
      60 elementos, painel esquerdo com 416 linhas e nenhuma "sem área".
      Commit de9dc3a.

- [x] A fase é derivada da fila
      416 células com passo de 1 a 7 (4·47·8·148·95·77·37) e nenhuma sem. Os
      dois eixos se mostram diferentes: `00 · fundação` sobe nos passos 1, 2,
      3 e 6; `05 · core banking e ledger` nos passos 4, 6 e 7.
      Commits 279c90b e bc6e6a1.

- [x] A interface diz `elemento` em português
      Painel "ELEMENTOS 48", abas do inspetor "Elemento · Decisões · Ligações",
      e a concordância ajustada em 23 frases. Commit 75f30d2.

- [x] Nome de cliente sai dos comentários do framework
      `verificar_limpeza.py` da instância: "nenhum termo desta instituição
      dentro do framework", contra 108 termos e 1632 arquivos. Commit 80bd91e.

- [x] Revisão cruzada com o Codex, rodada 1
      Reprovou 8 de 10 afirmações. Quatro achados reais, corrigidos com caso:
      o discriminador por aparência de valor, o vazamento de `os.environ`, o
      teto de colunas sem `ResizeObserver` e o `split('|')` nos ids.
      Commits be6726e e e4efcac.

- [ ] Revisão cruzada com o Codex, rodada 2
      Confirmar que os quatro furos fecharam, e que a contagem de 363 se
      sustenta contra a recontagem independente dele (ele mediu 335 sobre uma
      árvore de scratch anterior, porque o sandbox dele não tinha diretório
      temporário para gerar a árvore).

- [ ] A fase aparece na IDE
      Hoje a fase está no `.bio` e não tem vista. A decisão do dono era que o
      catálogo funcionasse como camadas — fase 1, o que sobe na fase 1; fase N.
      Falta a vista.
