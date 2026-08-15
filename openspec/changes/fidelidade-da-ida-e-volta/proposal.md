## Why

Uma especificação de bloco entra na ferramenta, vira grafo, e volta a ser
especificação. Duas coisas se perdem nesse trajeto, e as duas foram encontradas
gerando os seis projetos `.bio` de uma instância real.

**A decisão some.** A tabela de serviços de um bloco tem cinco colunas, e a
última diz qual decisão de arquitetura aquele serviço cumpre. O tradutor lê
quatro e descarta a quinta; o `especificacao()` da tela escreve `tela` no lugar
dela. Quem exporta o desenho de volta recebe um documento onde nenhum serviço
sabe mais por que existe. O rastro morre no primeiro ciclo, e é exatamente o
rastro que a regra da casa manda preservar: o que a ferramenta decide, ela
justifica.

**A ponta que sai do recorte vira texto solto.** Uma aresta pode terminar em
outro bloco, numa fronteira de terceiro ou num sistema externo. O catálogo já
distingue essas três coisas, e o desenho não: `id_do_texto()` devolve a string
que veio quando não acha nó, e `04-plataforma-dados` e `sistema externo` chegam
na tela do mesmo jeito. Quem lê o grafo não sabe se aquilo é vizinho nosso ou
caixa preta de outro.

## What Changes

- O tradutor passa a ler a quinta coluna da tabela de serviços e a guardar em
  `realiza` na unidade da proposta.
- `grafo_da_proposta()` leva `realiza` para o nó, e `especificacao()` o devolve
  na coluna, em vez de `tela`. Nó sem `realiza` continua escrevendo `tela`, que
  é a verdade para o desenho que nasceu na tela.
- Toda ponta de aresta ganha classificação: `interna` quando o nó existe no
  desenho, `bloco` quando é outro bloco da arquitetura, `fronteira` quando é
  terceiro nomeado no catálogo, `externa` quando é sistema de fora, `topico`
  quando é assunto do barramento. Os campos `de` e `para` continuam string, e a
  classificação entra em `de_classe` e `para_classe`.

## Capabilities

### New Capabilities

- `ida-e-volta`: o que a ferramenta garante quando um documento entra, vira
  desenho e volta a ser documento.

## Impact

- Quem já tem `.bio` salvo não perde nada: campo ausente cai no comportamento
  de hoje.
- A proposta ganha um campo por unidade e dois por aresta. O gerador não lê
  nenhum dos três, então a árvore gerada não muda.
- A tela recebe os campos novos e não os usa ainda. Mostrar a decisão ao lado do
  nó e desenhar a ponta de fora com marca própria é trabalho de interface, e
  entra em change própria, com prova de navegador.


## A segunda perna, medida em 2026-08-12

O trajeto espec → grafo → espec fechou. O trajeto **árvore → `.bio` → tela** foi
exercitado pela primeira vez com a instalação real: o `fase1.bio` do
a-instancia, 71 células e 229 dependências lidas por `desenho_da_arvore` +
`importar_terraform`, aberto na tela. A foto foi olhada, e quatro coisas se
perdem nessa perna:

1. **A posição não existe.** O desenho exporta grafo sem layout, a tela não
   posiciona sozinha: canvas vazio, zoom `NaN%`, e as 315 peças só na lista.
2. **A conta não viaja.** Toda peça abre "sem área". A célula sabe em que conta
   roda (`chave_conta` do root resolve), e o `.bio` não leva; `contas` sai
   vazio porque `contas.hcl` só tem `DECLARE_` antes do apply, e apelido sem
   número já bastaria para agrupar.
3. **A resposta não viaja.** 516 perguntas "waiting for an answer" e 1623
   questions para inputs que as células JÁ respondem nos `terragrunt.hcl`. A
   parametrização (`get_env`/`TG_*`) não aparece em peça nenhuma — e "ver o que
   foi parametrizado" é metade da razão de abrir o projeto.
4. **O comando do rodapé é de outro fluxo.** Com o projeto da instância aberto,
   a tela sugere `--perfil local --area live`, que não é o comando daquela
   instalação.
