## Why

Quem desenha um projeto grande não desenha do nada: existe uma arquitetura de
referência (blocos em markdown, diagramas, posters) que diz o que deve existir
e por quê. Hoje ela vive fora da ferramenta, e a ligação é manual: o
`verificar_cobertura.py` só a encontra por variável de ambiente apontando um
clone local, e a tela não sabe que ela existe.

A primeira instalação real mostrou o custo: o portão de cobertura passou
semanas desligado calado porque o caminho da referência não era declarado em
lugar nenhum, e responder "que parte da referência já está construída" exigia
cruzar três arquivos à mão.

## What Changes

- O projeto declara onde a referência mora: uma importação ou abertura de
  pasta, guardada no `.bio`, em vez de variável de ambiente que cada máquina
  redescobre.
- A referência vira insumo de lint: os portões que confrontam desenho com
  blocos (cobertura, e os que vierem) leem a declaração do projeto.
- A tela mostra a referência como base de conhecimento do projeto: de qual
  bloco cada peça vem, e o que os blocos pedem que ainda não tem peça.

Não é obrigatória: projeto sem referência declarada continua funcionando, e os
portões que dependem dela dizem "não se aplica" com a razão.

## Capabilities

### New Capabilities

- `referencia-do-projeto`: como um projeto declara, importa e usa a arquitetura de referência dele.

## Impact

- `.bio` ganha um campo de referência; a tela ganha a abertura de pasta; os
  verificadores que hoje dependem de `BIOMA_ARQUITETURA` passam a ler do
  projeto.
- Registrado como to-do da ferramenta por decisão de 2026-08-15: não entra
  agora, e nada do trabalho corrente depende dele.
