# Tasks

Régua: `ida_e_volta.py <projeto.bio> <instância>`. Medição de partida
(2026-08-15): células 112/112 · receitas 0/49 · arquivos interseção zero.

- [ ] O tradutor preserva `receita` e `id` do nó até a proposta.
      **Evidência:** a proposta com os dois campos, do `.bio` real.
- [ ] O gerador aponta a receita declarada em vez de inventar.
      **Evidência:** `ida_e_volta.py` com receitas 49/49.
- [ ] O gerador escreve a célula no `id` declarado.
      **Evidência:** `ida_e_volta.py` com interseção de células gerada×instância = 112.
- [ ] Os arquivos gerados convergem para os da instância.
      **Evidência:** a distância de arquivo reportada, com os "longe" listados
      e explicados um a um.
- [ ] O desenho nascido na tela não muda.
      **Evidência:** o caminho do zero (`prova-do-zero.py`) igual antes e depois.
