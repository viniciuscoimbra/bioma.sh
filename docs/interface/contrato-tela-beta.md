# Contrato da tela (beta)

A tela alvo é a síntese de três direções dadas pelo dono do produto: a superfície da primeira, o painel de decisão da segunda, e a segurança operacional da terceira como obrigatória na beta.

Este arquivo é contrato entre quem constrói as partes. Cada componente mora no próprio arquivo, recebe exatamente as propriedades daqui e não sabe da existência dos outros.

## A superfície

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ topo: marca · projeto · estado do rascunho · documentação · configurações      │
├───────────┬──────────┬───────────────────────────┬───────────────────────────┤
│ recursos  │ áreas do │  visão da arquitetura      │  decisões do tradutor      │
│ AWS       │ projeto  │  (canvas)                  │  ou célula selecionada     │
│ (busca +  │ (árvore  │                            │  ou pré-voo                │
│ categorias│ com      │                            │                            │
│ com       │ estado)  ├───────────────────────────┤  (o painel troca conforme  │
│ contagem) │          │ arquivos que vão nascer    │   o que está em foco)      │
│           │          │ + visor de código          │                            │
├───────────┴──────────┴───────────────────────────┴───────────────────────────┤
│ comando (sempre visível, nada é oculto) · corrigir pendências · provar · aplicar│
└──────────────────────────────────────────────────────────────────────────────┘
```

Colunas: 232px, 200px, 1fr, 400px. Linhas: 56px topo, 1fr, 60px base.

## Estado compartilhado (mora na Tela, desce por propriedade)

```js
{
  projeto: 'plataforma-dados',
  perfil: 'local',                       // local | ensaio | sandbox
  nos: [{ id, tipo, servico, papel, zona, conta, regiao, multiplicidade, x, y, valores: {} }],
  arestas: [{ de, para, flui, canal }],
  escolhido: id | null,
  proposta: { unidades: [...], relacoes: [...] } | null,
  arquivos: { 'caminho': 'conteúdo' },
  preVoo: { preenchimento, cobertura, durabilidade, plano },   // cada um: 'ok' | 'bloqueado' | 'pendente'
  janela: '' | '2026-08-06 22:00',       // declaração para destruir tecido estável
}
```

## Os componentes

### `PainelRecursos` (src/painel-recursos.jsx)

```js
{ busca, aoBuscar(texto), categorias, aoEscolher(tipo), contagem: { tipo: quantos } }
```

Busca no topo. Abaixo, os recursos agrupados por categoria da AWS (armazenamento, computação, banco, mensageria, rede, segurança, observabilidade), cada linha com o ícone oficial e a contagem de quantos daquele tipo já estão no desenho. Categoria fechada por padrão quando vazia.

Ícone: `/icone?tipo=aws_s3_bucket` devolve o PNG oficial. Nunca desenhar ícone à mão.

### `PainelAreas` (src/painel-areas.jsx)

```js
{ areas: [{ nome, estado }], ativa, aoEscolher(nome) }
```

Estado por área: `completa` (círculo cheio verde), `emAndamento` (círculo pela metade), `vazia` (círculo vazio). Área é o recorte do projeto que o desenho está tratando (fundação, rede, dados, observabilidade, segurança).

### `Canvas` (src/canvas.jsx)

```js
{ nos, arestas, proposta, escolhido, aoEscolher(id), aoMover(id, x, y), aoLigar(de, para),
  zoom, aoZoom(valor), pan, aoPan({x,y}) }
```

Cada nó desenha o ícone oficial da AWS, o tipo e o nome. As contas viram caixas tracejadas rotuladas `conta: <nome>`, e as peças moram dentro delas. Aresta com tipo visual próprio, com legenda embaixo do canvas:

- linha cheia: dependência
- linha tracejada verde: ligação entre contas
- linha pontilhada cinza: cifra e segurança

Controles no topo direito do canvas: tela cheia, menos, percentual, mais.

### `PainelDecisoes` (src/painel-decisoes.jsx)

```js
{ unidades, relacoes, aoResponder(unidade, campo), aoSelecionar(unidade) }
```

Um cartão por unidade, com ícone, tipo do recurso, nome, e a etiqueta do que o tradutor decidiu (`célula estável`, `tecido permanente`, `efêmera`, `tubo`), mais o bloco **por que** com a razão em prosa. Quando houver pendência, um aviso âmbar dentro do cartão com o nome do campo, o valor aceito e o botão **responder**.

No pé, a linha recolhível `dependências e ligações geradas` com a contagem.

### `PainelCelula` (src/painel-celula.jsx)

```js
{ no, unidade, campos, aoMudar(campo, valor), validacao: { campo: {ok, mensagem} } }
```

Formulário da célula em foco: nome, conta AWS, região, durabilidade, e os campos que a receita exige. Cada campo validado na hora, com marca verde quando aceito e mensagem em âmbar quando recusado, dizendo o valor aceito. No pé, o resumo da validação.

### `PreVoo` (src/pre-voo.jsx)

```js
{ checagens: [{ nome, detalhe, estado }], bloqueio, janela, aoMudarJanela(v), comandoPrevisto }
```

Lista de checagens com estado. Quando houver bloqueio de destruição, o cartão âmbar com o motivo, o campo de janela de mudança e o comando previsto em cinza, desabilitado até a janela ser declarada.

**Regra da beta, obrigatória:** destruição fica bloqueada enquanto qualquer checagem estiver bloqueada, e o botão de destruir nasce travado.

### `Arquivos` (src/arquivos.jsx)

```js
{ arquivos, aberto, aoAbrir(caminho), abas: ['gerados','contratos','dependências','plano'], aba, aoTrocarAba }
```

Árvore hierárquica à esquerda, visor de código à direita com numeração de linha e realce de sintaxe simples (comentário, string, palavra reservada). Arquivo com pendência marcado em vermelho.

### `BarraComando` (src/barra-comando.jsx)

```js
{ comando, pendencias, podeAplicar, podeDestruir, aoCopiar, aoProvar, aoAplicar, aoDestruir }
```

O comando aparece por inteiro, sempre, com a etiqueta `nada é oculto`. Botões: copiar, corrigir pendências (quando houver), provar, aplicar. Destruir aparece travado com cadeado quando o pré-voo bloqueia.

## O servidor

| rota | o que faz |
|---|---|
| `GET /recursos?q=` | busca nos recursos do esquema, com categoria e contagem de obrigatórios |
| `GET /icone?tipo=` | devolve o PNG oficial da AWS daquele recurso |
| `POST /subir` | recebe diagrama (`.md` de especificação, `.drawio`, `.png`) e devolve o grafo quando conseguir ler, ou a imagem para conferência quando não |
| `POST /gerar` | grafo entra, proposta e arquivos saem |
| `POST /pre-voo` | roda os verificadores e devolve o estado de cada checagem |
| `POST /rodar` | executa `bioma.sh` no perfil declarado e devolve a saída |

## Regras que valem para todas as partes

Tokens do refy-ui, nada de valor solto. Português. Toda decisão que a ferramenta toma aparece com a razão ao lado. O comando nunca some da tela. Nada é destruído sem janela declarada.
