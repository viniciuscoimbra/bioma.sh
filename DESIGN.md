# Design do bioma.sh

O sistema visual é o [refy-ui](tela/refy-ui), copiado do projeto Dommus. Os tokens dele mandam: cor, tipografia, espaço, raio e movimento saem de `tela/refy-ui/src/tokens/tokens.css`. Nada de valor solto no CSS da tela.

## Tema: claro

A cena decide, e ela é esta: um arquiteto e um engenheiro lado a lado, de dia, com a tela compartilhada numa reunião, montando o desenho de um núcleo bancário e lendo o código gerado em voz alta enquanto discutem.

Tela compartilhada em reunião pede claro. Escuro seria o reflexo de categoria (ferramenta de infraestrutura nasce escura por hábito) e brigaria com os posters de arquitetura que a Skopia já entrega, que são claros e vão aparecer ao lado desta tela na mesma apresentação.

O tema é o `light` do refy, com o atributo `data-theme="light"` na raiz.

## Cor: contida, com o verde da marca carregando o significado

Neutros do refy para tudo. O verde da marca (`--primary`) não decora: ele marca o que está vivo e o que foi decidido. Três papéis de cor, e só três:

**Verde** para o que a ferramenta decidiu e você pode confiar (ligação derivada, argumento preenchido sozinho, receita que valida).

**Âmbar** para o que espera você (pergunta sem resposta, ficha pendente).

**Vermelho** para o que a ferramenta recusa (tecido permanente numa ordem de destruição, formato inválido).

Tecido tem cor própria e constante em toda a tela, porque é o conceito que decide destruição: permanente, estável e efêmero sempre aparecem com a mesma marca, no nó do canvas e na árvore de arquivos.

## Tipografia

Do refy: `--font-body` (Inter) para texto, `--font-mono` (JetBrains Mono) para tudo que é código, caminho de arquivo, nome de recurso e comando. A separação é semântica: se aparece num terminal ou num arquivo, é mono.

## Layout

Canvas ocupa o maior pedaço, porque montar é o trabalho. A estrutura gerada fica ao lado, visível o tempo todo, e não escondida atrás de um clique: o valor da ferramenta é ver o código nascer enquanto se monta.

Sem card dentro de card. O canvas serve de plano de fundo do trabalho, sem moldura própria.

## Movimento

Curvas de saída exponenciais do refy. Movimento serve para explicar o que aconteceu: nó que nasce, linha que se liga, arquivo que aparece na árvore. Nada de transição decorativa.

## Proibições próprias desta tela

**Comando escondido.** Botão que executa mostra o texto do comando antes de executar. Sem exceção.

**Decisão silenciosa.** Toda classificação que a ferramenta faz sozinha (tecido, ligação, fronteira) aparece com a razão ao lado, legível sem clique.

**Canvas infinito sem chão.** Espaço vazio sem grade nem referência faz a pessoa se perder. Grade discreta, e sempre um jeito de voltar ao centro.

**Modal para trabalho.** Preencher ficha, ver arquivo e ler razão acontecem no lugar, não em janela que tampa o que a pessoa estava olhando.
