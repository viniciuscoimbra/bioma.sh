## 1 · Layout estrutural

- [x] **1.1 Coluna por profundidade, faixa por conta.** No `le()` do
      importador, determinístico, com ciclo declarado não derrubando o desenho.
      _Evidência: fase1.bio com 6 colunas de profundidade e faixas por conta
      rotuladas; a fileira única de 71 peças virou um desenho em que os fluxos
      se leem. Foto olhada em 2026-08-12._

## 2 · Páginas por fase

- [ ] **2.1 A fase viaja na peça.** `desenho_da_arvore --fases <mapa>` grava
      `fase` em cada célula. _Evidência: fase1.bio com fase por peça
      (5/7/2/19/27/9 células nas fases 1 a 6; 2 sem fase, as adiadas)._ FEITO —
      falta a metade da tela para a task fechar.
- [ ] **2.2 O canvas pagina.** Abas como planilha: uma página por fase, mais
      "tudo"; a lista da esquerda continua inteira. _Evidência esperada: abrir o
      fase1.bio, clicar na aba da fase 2 e ver só as 7 contas; foto olhada._

## 3 · A posição sobrevive

- [x] **3.1 `salvar_bio` preserva a origem.** A Tela guarda `origem` no abrir e
      a devolve no salvar; o servidor a grava. Sem isso, salvar descartava o
      comando de execução do projeto. _Evidência: os sete portões do
      repositório, com a prova de tela incluída, passam com o build novo._
