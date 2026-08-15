# AGENTS.md — contrato de trabalho neste repositório

Vale para qualquer agente de código e para qualquer pessoa. Leia antes de tocar em arquivo.

## Fontes de verdade, nesta ordem

1. `openspec/changes/<nome>/tasks.md` — o trabalho combinado, com a evidência de cada task
2. `openspec/changes/<nome>/design.md` — as decisões e as alternativas recusadas
3. `openspec/specs/<capability>/spec.md` — o comportamento que vale hoje
4. `README.md` — o que a ferramenta é e o que ela não é
5. O código, que é `ferramentas/` (traduzir e gerar), `tela/` (servidor e app) e `bioma.sh` (o comando)

Não invente trabalho fora das tasks. Se algo parecer necessário e não estiver especificado, pare e reporte.

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

## O que exige decisão humana

- licença, dependência nova e qualquer coisa que envolva código de terceiro
- mudar o que o produto promete
- apagar dado de quem usa, ou reescrever histórico do Git
- publicar em registro, em repositório remoto ou em qualquer lugar fora da máquina

O resto é trabalho de agente.

## Como propor mudança

Uma pasta em `openspec/changes/<nome>/` com `proposal.md` (Why, What Changes, Capabilities, Impact), `design.md` quando houver decisão a tomar, `specs/<capability>/spec.md` em Requirement/Scenario, e `tasks.md` com a evidência esperada de cada item. Depois `openspec validate <nome>`.

Change que muda comportamento sem spec é change que ninguém consegue revisar.
