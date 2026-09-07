# AGENTS.md — contrato de trabalho neste repositório

Vale para qualquer agente de código e para qualquer pessoa. Leia antes de tocar em arquivo.

## Fontes de verdade, nesta ordem

1. `openspec/changes/<nome>/tasks.md` — o trabalho combinado, com a evidência de cada task
2. `openspec/changes/<nome>/design.md` — as decisões e as alternativas recusadas
3. `openspec/specs/<capability>/spec.md` — o comportamento que vale hoje
4. `README.md` — o que a ferramenta é e o que ela não é
5. O código, que é `ferramentas/` (traduzir e gerar), `tela/` (servidor e app) e `bioma.sh` (o comando)

Não invente trabalho fora das tasks. Se algo parecer necessário e não estiver especificado, pare e reporte.

## O que o bioma.sh é, e o que o `.bio` é

Leia esta seção antes de tocar em qualquer coisa do framework. Ela define o
produto, e é dela que a regra pétrea abaixo decorre.

**O bioma.sh é framework mais IDE.** É onde as pessoas montam a infraestrutura
delas, e por isso ele é genérico: nada de cliente nenhum vive dentro. Quando
alguém monta a sua infraestrutura, parametriza o que é parâmetro e **não pode
ser herdado**. O resto o framework deduz, herda ou decide, e justifica a
decisão. Escrever parâmetro à toa é defeito: só vira parâmetro o que exige
intervenção humana, e é ali que o HITL mora.

**O `.bio` é o projeto.** Ele guarda o que o humano escreveu mais tudo o que o
framework conseguiu construir a partir disso, e reflete exatamente a
infraestrutura que foi gerada. Tudo quer dizer tudo: domínios, variáveis de
cada organismo e célula, configurações, posição de cada elemento na tela,
estado de preenchimento das perguntas, resultado dos linters. Abrir o `.bio`
devolve o projeto carregado, no ponto em que estava.

A intenção é essa: **quem trabalha continua de dentro da IDE, sem sair**. Um
`.bio` que não devolve o projeto inteiro não é formato de projeto, é anotação
parcial, e aí o bioma vira uma camada de abstração a mais para complicar o que
já funcionava sem ele. Toda mudança no framework se mede contra isso.

## Regra pétrea: a ida e volta do `.bio`

O bioma é a ferramenta que gera o `.bio`; o `.bio` remonta o projeto inteiro;
exportar o `.bio` gera o código da instância. O bioma não tem NADA de cliente
nenhum: ele tem as peças com que alguém constrói, e os conceitos de domínio
pertencem a quem desenhou.

Três perguntas, em TODA mudança de código, aqui ou numa instância:

1. Abrindo o `.bio` com o que este framework tem (tela, parâmetros, peças), o
   código da instância sai de novo? Se não, o framework absorve a mudança **de
   forma genérica**.
2. O código que a instância editou à mão é o que o `.bio` geraria? Se não, o
   framework é atualizado até gerar.
3. O código exportado é o que a instituição quer na nuvem? Se não, ajusta-se o
   código até ser funcional em produção, e só então o `.bio`.

Quem cobra a parte de limpeza é `verificar_limpeza.py`, rodado DA instância: o
vocabulário do cliente vem do que ela declara, nunca de lista escrita aqui.

## Regra de ouro: prova ou não aconteceu

Cada tipo de mudança tem a prova que a fecha. Sem ela, a task fica `[ ]` e o que falta é anotado.

| O que mudou | O que prova |
|---|---|
| tela | navegador (Playwright ou equivalente): o clique dado, o resultado medido, e a foto **olhada** |
| gerador ou tradutor | a árvore gerada: o arquivo que saiu, com o trecho que mudou |
| servidor | a rota chamada e a resposta, com `curl` ou pelo navegador |
| texto de interface | a frase nova em contexto, nas duas línguas |

Foto tirada e não olhada não é prova. Três defeitos deste repositório passaram por aí: uma regra de CSS de três colunas que nunca entrou em vigor porque outra regra vencia por especificidade, uma aba do inspetor que não respondia ao clique porque o componente casa por `id` e recebia `value`, e as respostas da ficha que nunca chegavam ao gerador. Nos três casos o código estava escrito e a prova não tinha sido lida.

## Recurso da AWS não sai de adivinhação

O tipo de recurso vem de tabela escrita à mão (`tela/servicos-canonicos.json`, `tela/icones-poster.json`, `ferramentas/mapa_recursos.json`) e é validado contra o esquema do provider. Nada de casar por semelhança de nome.

A razão está no histórico: heurística de nome gerou `aws_glue_crawler` para um bucket, `aws_msk_topic` para um cluster e um `aws_dynamodb_tag` que não existe. Recurso plausível passa no lint e falha no apply, que é o pior momento para descobrir.

Onde a tabela não conhece o serviço, o gerado diz isso por escrito, em vez de escolher.

## O que a ferramenta decide, ela justifica

Toda classificação que o tradutor faz (onde a peça mora, o que acontece se ela cair, se a seta vira ligação) aparece na tela com a razão ao lado, em português. Decisão sem razão escrita não entra.

## Estilo

Português do Brasil no código, nos comentários, nos commits e na documentação. A interface é bilíngue: EN-US é o padrão, PT-BR entra pelo seletor, e **toda** microcopy passa por `tela/app/src/dicionario.js`. Texto solto em componente é defeito.

Declarativo, sem hedging. Ideia primeiro, frase curta, cada palavra justificando a presença.

Fora: o adjetivo de louvor que não mede nada e o verbo de consultoria que não faz nada (o tipo que aparece em texto de marketing e some quando se pergunta qual é o número); travessão em prosa, que vira parênteses, dois-pontos ou vírgula; a construção que nega para depois afirmar; tríade dramática; abertura e fechamento cerimoniais; bold como tese.

Na dúvida, leia a frase em voz alta e pergunte o que ela afirma que dá para conferir. Se não sobrar nada conferível, ela é enfeite.

Comentário no código explica a restrição que o código não mostra, ou a razão de a solução óbvia não servir. Nunca narra o que a linha faz, nem de onde veio a mudança.

## Commit

Assunto em português, imperativo, dizendo o efeito e não o arquivo. O corpo diz o que estava errado antes, o que passou a valer e a prova. Um commit por assunto.

```
Domínio em uso não sai calado, e apagar o desenho não fecha o projeto

Apagar um domínio era irreversível e silencioso: levava os filhos junto sem
dizer, e nem perguntava se alguma conta ou peça dependia dele. Agora o
domínio soma o uso da subárvore e, tendo conta ou peça, o × dá lugar ao motivo.
```

Nunca `git add -A` sem olhar o que entrou. Este repositório já perdeu uma remoção de 2594 arquivos porque um `git stash` no meio desfez o índice e o commit passou sem ela.

## A nuvem está fora do alcance do agente

Nem escrita, nem leitura. Decidido em 2026-09-07, e não é preferência de estilo:
a credencial é de um cliente, e usar a conta dele fora do combinado expõe uma
pessoa a responder por isso.

Ler não é inofensivo. `sts assume-role` entra numa conta e deixa registro no
CloudTrail dela; listar objeto de balde é acesso a dado de terceiro. A régua é
simples: **se o comando fala com a AWS, ele não é do agente.**

O trabalho é o CÓDIGO — o do framework e o da instância. O que a nuvem tem se
aprende do código que já foi gerado e aplicado, por engenharia reversa, e é daí
que sai o que o framework absorve de forma genérica.

`.agents/hooks/guarda.py` cobra isso antes do comando sair, com caso escrito:
recusa `aws`, `terraform` e `terragrunt` fora de `fmt` e `validate`, o
`bioma.sh` e as dezesseis ferramentas da instância que leem a nuvem. Passam
`terraform fmt`, `terraform validate`, `terragrunt hcl format`, e qualquer
comando que só MENCIONE a nuvem num texto.

Quem aplica é quem opera, com a própria credencial.

## O que exige decisão humana

- licença, dependência nova e qualquer coisa que envolva código de terceiro
- mudar o que o produto promete
- apagar dado de quem usa, ou reescrever histórico do Git
- publicar em registro, em repositório remoto ou em qualquer lugar fora da máquina

O resto é trabalho de agente.

## O harness: o que guarda o trabalho do agente

`.agents/` é a casa do harness. `.claude/` e `.codex/` são cascas: um arquivo
que importa de lá, ou um link simbólico. Regra escrita em dois lugares diverge
em silêncio.

As skills e os scripts valem para as duas ferramentas. O hook de comando só o
Claude Code liga, porque o Codex CLI não tem o equivalente de `PreToolUse`;
a tabela em `.agents/README.md` diz até onde a neutralidade vale hoje.

```
.agents/hooks/guarda.py       recusa, ANTES da ação, o que já custou caro aqui
.agents/scripts/              o que o CI cobra: evidência, prova de PR, placar
.agents/fixtures/casos.json   o caso recusado E o vizinho que passa, por regra
.agents/skills/               o procedimento, lido pelas duas ferramentas
```

**Portão sem caso é carimbo.** Todo script de `.agents/` aceita `--autoteste`, e
o autoteste tem duas metades: o caso que ele recusa, com a data do erro que o
criou, e o vizinho que ele deixa passar. A segunda metade é a que impede o
portão de ensinar a desviar dele.

**O portão de comando não é barreira de segurança.** Ele casa grafia, e grafia
se troca. O que ele impede é a mão no automático. Tratá-lo como barreira daria
sensação de proteção onde há lembrete.

Três comandos fecham qualquer sessão:

```
python3 .agents/scripts/evals_do_harness.py     nenhum caso órfão, nenhum portão sem caso
python3 .agents/scripts/placar_do_harness.py    o harness continua inteiro
bash testes/portoes.sh                          os portões do produto
```

**Quem escreveu não valida o próprio trabalho.** Mudança em `ferramentas/`,
`tela/`, `catalogo/` ou `.agents/` fecha com revisão de outro fornecedor
(skill `verificacao-cruzada`). Nesta casa isso não é cerimônia: quatro medições
publicadas numa sessão, refeitas por um segundo parser, mudaram em cinco pontos,
e uma delas errava por 382 valores.

**Antes de criar execução recorrente**, as seis perguntas da skill
`portao-do-loop`, respondidas contra fato e escritas no `tasks.md` da change.

## Como propor mudança

Uma pasta em `openspec/changes/<nome>/` com `proposal.md` (Why, What Changes, Capabilities, Impact), `design.md` quando houver decisão a tomar, `specs/<capability>/spec.md` em Requirement/Scenario, e `tasks.md` com a evidência esperada de cada item. Depois `openspec validate <nome>`.

Change que muda comportamento sem spec é change que ninguém consegue revisar.
