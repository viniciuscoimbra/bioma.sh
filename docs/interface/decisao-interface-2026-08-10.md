# Contrato da tela, segunda versão

Substitui `CONTRATO-TELA.md`. A crítica do dono do produto que gerou esta versão: informação demais sem colapsar, código apertado demais para ler e conferir, e vocabulário do bioma na tela sem nada que explique.

**O canvas é a figura central.** Todo o resto se recolhe.

## A casca

```
┌──────────────────────────────────────────────────────────────────────────┐
│ topo:  bioma.sh · [prefixo]/[nome do projeto] · contas · ajuda            │
├────┬────────────────────────────────────────────────────┬────────────────┤
│ e  │                                                    │  decisões      │
│ l  │                    CANVAS                          │  (recolhível)  │
│ e  │              (ocupa todo o resto)                  │                │
│ m  │                                                    │                │
│ .  │                                                    │                │
├────┴────────────────────────────────────────────────────┴────────────────┤
│ barra: [ver código] [pendências (n)] · comando · simular · aplicar        │
└──────────────────────────────────────────────────────────────────────────┘
```

Trilho esquerdo: os elementos já usados no desenho. Aberto 232px, recolhido 44px com só os ícones. O estado do recolhimento guarda em `localStorage`.

Trilho direito: as decisões do tradutor. Aberto 380px, recolhido some, com um puxador na borda.

Nada mais fica fixo na tela. Arquivos, código, pendências e ajuda são gaveta.

## As gavetas

Gaveta é painel que entra por cima do canvas, com fundo escurecido, fechando por Esc ou clique fora. Nunca duas abertas ao mesmo tempo.

| gaveta | de onde | tamanho | o que tem |
|---|---|---|---|
| código | botão `ver código` na barra | de baixo, 62vh, redimensionável | árvore de pastas à esquerda (240px) e o código à direita, com número de linha, fonte 13px e altura de linha 1.7 |
| pendências | botão `pendências (n)` na barra | da direita, 480px | uma linha por pendência: qual célula, qual campo, o que se aceita, exemplo. Botão `corrigir` leva o foco ao campo e fecha a gaveta |
| ajuda | qualquer link `entenda` e o botão `ajuda` do topo | da direita, 520px | os verbetes do glossário, rolando até o verbete pedido |
| contas | botão `contas` do topo | da direita, 440px | cadastro das contas AWS reutilizáveis |

## Busca de recurso por atalho

`cmd+K` (e `ctrl+K`) abre a paleta no meio da tela. Digita, aparece a lista com ícone e categoria, `enter` ou clique põe a peça no canvas, no centro da vista, já selecionada. `esc` fecha. Sem a paleta aberta, não existe outra lista de 1687 recursos ocupando espaço.

## O que sai da tela

**O seletor de perfil.** Na beta só `local` funciona. Volta quando os três existirem.

**A aba de pré-voo.** As conferências passam a ser etapa do botão: `simular` e `aplicar` rodam o pré-voo primeiro e, se algo bloquear, abrem a gaveta de pendências com o motivo. Ninguém precisa visitar uma aba para saber se pode.

**A coluna de áreas.** Vira um seletor dentro da própria peça, junto de onde ela mora. A área continua existindo no modelo; deixa de ocupar uma coluna.

## Explicar o vocabulário, na tela

Todo termo do bioma que aparece na tela ganha `Ajuda` ao lado. Componente novo:

```js
<Ajuda verbete="tecido">tecido</Ajuda>
```

Passa o mouse e sai a definição em uma frase, com o link `entenda`. O link abre a gaveta de ajuda no verbete.

Verbetes obrigatórios, com o texto que precisa aparecer:

| verbete | uma frase | o que a pessoa precisa entender |
|---|---|---|
| `decisao` | O que o bioma resolve sozinho a partir do seu desenho. | Cada decisão vira pasta, arquivo ou trava. Discordar aqui é mais barato que corrigir depois. |
| `tecido` | O que acontece se a peça for destruída e recriada. | Três valores: efêmera (volta igual), estável (refaz com janela), permanente (não volta). Decide o que o comando de destruir aceita derrubar. |
| `ligacao` | Seta que atravessa conta. | Vira peça própria, com permissão declarada dos dois lados, porque nenhuma conta manda na outra por padrão. |
| `celula` | Uma pasta com estado próprio. | É a menor coisa que nasce e morre junta. |
| `area` | A conta onde a peça mora. | Decide em que pasta ela cai e quais setas viram ligação. |
| `pre-voo` | As conferências antes de tocar a nuvem. | Preenchimento, cobertura, durabilidade e plano. Bloqueio para o comando antes de qualquer estrago. |
| `simular` | Mostra o que aconteceria, sem mudar nada. | É o `plan` do Terraform, e nada é criado nem destruído. |
| `gerado` | Arquivo escrito pelo bioma. | Ninguém edita à mão: o desenho e a ficha são a fonte, e a próxima geração sobrescreve. |

## Contas cadastradas

Gaveta de contas, guardada pelo servidor em `tela/contas.json`:

```json
[{ "apelido": "dados-prod", "numero": "111111111111", "area": "Platform (dados)", "padrao": true }]
```

Uma delas é a padrão, e é a que a peça nova usa. O campo de conta na peça vira escolha entre as cadastradas, com a opção de cadastrar na hora. Número de conta tem 12 dígitos e o campo cobra isso.

## Nome do projeto

Prefixo fixo à esquerda dentro do mesmo campo, no formato `<prefixo>/`, e o nome editável à direita. O prefixo sai das configurações e nasce vazio, com o campo pedindo para preencher.

## O que continua valendo da primeira versão

Ícone oficial da AWS em toda peça. Conta como caixa rotulada no canvas. Três tipos de aresta com legenda, e a legenda passa a explicar que **quem classifica é o bioma**, e não a pessoa. Comando por inteiro na barra. Destruição travada sem janela declarada. Tokens do refy-ui para todo valor visual. Português, sem vocabulário de IA, sem travessão em prosa.

## Entrada de desenho

O caminho da beta é a arquitetura de referência que já tem o `.md` de especificação, com o HTML ou PNG do poster como conferência visual. O `.drawio` fica para depois: leitura parcial atrapalha mais do que ajuda.
