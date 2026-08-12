## 1 · Layout estrutural

- [x] **1.1 Coluna por profundidade, faixa por conta.** No `le()` do
      importador, determinístico, com ciclo declarado não derrubando o desenho.
      _Evidência: fase1.bio com 6 colunas de profundidade e faixas por conta
      rotuladas; a fileira única de 71 peças virou um desenho em que os fluxos
      se leem. Foto olhada em 2026-08-12._

## 2 · Páginas por fase

- [x] **2.1 A fase viaja na peça.** `desenho_da_arvore --fases <mapa>` grava
      `fase` em cada célula. _Evidência: fase1.bio com fase por peça
      (5/7/2/19/27/9 células nas fases 1 a 6; 2 sem fase, as adiadas)._
- [x] **2.2 O canvas pagina.** Abas como planilha no rodapé do canvas: "tudo",
      uma por fase, e "adiadas" quando há peça sem fase; a lista da esquerda
      continua inteira. A página COMPACTA a vista (colunas e ordem preservadas,
      faixas vazias somem) sem tocar a posição real, e o quadro enquadra
      sozinho na troca — várias peças mudando é página, uma peça mudando é
      edição, e edição não rouba o quadro. _Evidência: fase1.bio aberto, aba
      "phase 2" mostra as 7 contas em coluna a 71% de zoom, legíveis; "tudo"
      volta ao desenho como era. Fotos olhadas em 2026-08-12._

## 3 · A posição sobrevive

- [x] **3.1 `salvar_bio` preserva a origem.** A Tela guarda `origem` no abrir e
      a devolve no salvar; o servidor a grava. Sem isso, salvar descartava o
      comando de execução do projeto. _Evidência: os sete portões do
      repositório, com a prova de tela incluída, passam com o build novo._
