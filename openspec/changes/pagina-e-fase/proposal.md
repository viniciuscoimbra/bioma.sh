## Why

Um campo do desenho carregava duas perguntas. `n.fase` guardava o bloco da
arquitetura de referência ("00 · fundação"), e as abas liam esse campo: a IDE
chamava de fase o que é recorte de leitura, e o passo do processo de deploy não
tinha onde morar. O dono do produto fixou o vocabulário em 2026-09-07:

- **fase** é o processo de deploy, dividido em fases: o que sobe na fase 1, o
  que sobe na fase N.
- **página** é a aba, um novo canvas sobre os mesmos elementos.
- **Todas as Páginas** é a visão geral, e é o que garante que todo elemento
  relacionado ao menos uma vez vive.
- **elemento** é a coisa no canvas.

A mesma decisão apanhou uma terceira palavra. `trilho` nomeava três coisas: o
domínio do elemento, as duas colunas laterais da tela e o inspetor da direita.
A tela já lia `n.dominio` e o gerador ainda escrevia `n.trilho`, e o efeito
estava na tela sem ninguém ter lido: os 416 elementos de um projeto real abriam
com "sem área" no painel esquerdo.

## What Changes

- `n.trilho` passa a ser `n.dominio`. A CHAVE muda; o VALOR não, porque ele é
  componente do caminho de `catalogo/organismos/<domínio>/`.
- `n.pagina` passa a guardar o bloco da referência, e é o que as abas leem.
- `n.fase` passa a ser o passo do deploy, **derivado** de `contrato/fila.json`.
  Não vira parâmetro: a ordem de aplicar já está declarada, e o framework só
  parametriza o que exige gente.
- O `.bio` ganha versão 2. A versão 1 é traduzida na leitura, num lugar só.
- A interface diz `elemento` também em português.
- A régua da regra pétrea passa a medir byte, e não semelhança de linha.

## Capabilities

- `desenho-legivel` — a página como recorte de leitura, e a fase como passo

## Impact

- `ferramentas/`: `caminho_gerador`, `desenho_da_arvore`, `fila`, `gerar_iac`,
  `traduzir_bloco`, `importar_terraform`, `ida_e_volta` e os verificadores
- `tela/`: `Tela.jsx`, `canvas.jsx`, `dicionario.js`, `servidor.py`
- `testes/`: `unidade.py`, `bio_ida_e_volta.py`, `arvore-esperada/`
- `.agents/`: o portão de comando passa a julgar cada invocação da linha, e não
  a linha. Ele continua sendo o que o AGENTS.md diz que é — casador de grafia,
  não barreira: `python3 -c "import subprocess..."` alcança a nuvem e ele não
  vê. O que ele impede é a mão no automático, e a concatenação desarmava isso.
- Instância: o `.bio` é reimportado; `convencoes.json` e `contas.hcl` do cliente
  seguem lidos na grafia antiga, porque migrar arquivo dele é decisão dele
