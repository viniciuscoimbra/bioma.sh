## Why

O fase1.bio de uma instalação real abriu na tela com as 71 células numa fileira
única: tudo presente, nada legível. Ler o desenho inteiro era impossível — e um
desenho que não se lê não cumpre a função de desenho. Três faltas, apontadas
pelo dono do produto em 2026-08-12:

1. não havia layout: a posição saía de uma grade por ordem de chegada;
2. não havia como ver por partes: uma árvore de entrega tem fases, e o desenho
   mostrava tudo de uma vez;
3. a posição ajustada na tela não tinha garantia de sobreviver ao salvar — o
   `salvar_bio` descartava a `origem` do projeto, e com ela o comando de
   execução.

## What Changes

1. **Layout determinístico pela estrutura**: coluna é a profundidade na cadeia
   de dependências (quem não depende de ninguém à esquerda), faixa é a conta.
   Sai do dado, no importador — a tela não inventa posição, e desenho
   previsível se lê duas vezes igual.
2. **Páginas por fase, como abas**: a lista da esquerda continua mostrando tudo
   (como uma ferramenta de DER), e o canvas ganha páginas — uma por fase de
   entrega, mais a visão inteira. A fase já viaja na peça (`fase`, via
   `--fases` do desenho); falta a tela paginar.
3. **A ida-e-volta do canvas fecha**: `salvar_bio` preserva a `origem`, e a
   posição que a pessoa ajustou volta no próximo abrir.

## Capabilities

- `desenho-legivel`: layout estrutural, navegação por fases e persistência de
  posição no ciclo abrir → ajustar → salvar → abrir.

## Impact

- `ferramentas/importar_terraform.py` (layout), `ferramentas/desenho_da_arvore.py`
  (`--fases`), `tela/servidor.py` e `tela/app` (origem no salvar; páginas).
- Conecta com `plano-de-entrega`: as páginas são a cara visual do plano.
