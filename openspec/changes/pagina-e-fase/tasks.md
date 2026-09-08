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

- [x] Revisão cruzada com o Codex, rodada 2
      Confirmou o escopo do ambiente e a contagem de 363 rodando da instância.
      Refutou cinco itens, e quatro viraram conserto:

      A divergência 335 × 363 NÃO era árvore velha, e este é o achado que mais
      valeu: `raiz_do_catalogo` procura ao lado de `__file__`, então a cópia do
      framework media contra `bioma.sh/catalogo` e a da instância contra
      `infra/catalogo`, e 28 células mudavam de resposta. A régua agora declara
      o catálogo da instância medida, e dá 363 dos dois lados.

      `vocabulario_antigo` deixava `trilho` num documento que se declarasse
      versão 2, e `salvar_bio` carimbava 2 sem normalizar o grafo que a tela
      manda: um arquivo se declarava em dia e nunca mais seria migrado.

      O portão ainda passava por subshell, `$( )`, crase, `bash -c`, `xargs -I`
      e caminho absoluto do binário.

      O enquadramento do desenho unitário não fechava: o canvas monta com zero
      peça, então o conjunto anterior é vazio e não `null`.

      A contagem anunciada do teste dizia 17 onde havia 14.

- [x] Revisão cruzada com o Codex, rodada 3
      Confirmou a régua independente da cópia, a tradução por versão em todas
      as bordas, a normalização na escrita e a contagem executada do teste.
      Refutou dois pontos, e os dois eram defeito que o conserto anterior
      criou: o corte por parêntese e crase passou a cortar TEXTO entre aspas
      (escrever num documento a frase "o subshell (aws sts) é exemplo" era
      recusado), e enquadrar o desenho unitário passou a roubar o quadro de
      quem põe a primeira peça à mão. O primeiro fechou neutralizando abertura
      de comando dentro de aspas, como já se fazia com os separadores; o
      segundo trocou o palpite por aviso da composição: quem substitui o grafo
      inteiro é quem sabe que o desenho chegou de fora.

- [ ] A fase aparece na IDE
      Hoje a fase está no `.bio` e não tem vista. A decisão do dono era que o
      catálogo funcionasse como camadas — fase 1, o que sobe na fase 1; fase N.
      Falta a vista.
