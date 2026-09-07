---
name: portao-do-loop
description: As seis perguntas que decidem se uma tarefa vira loop autônomo, trabalho manual, ou proposta com humano no circuito. Use ANTES de criar qualquer execução recorrente ou não supervisionada, e ao promover uma tarefa de supervisionada para autônoma.
metadata:
  version: "1.0"
---

# Portão do loop

Só vira loop autônomo se as seis respostas forem sim. Dúvida numa resposta conta
como não.

Cada resposta é contra fato: qual portão existe, qual comando reprova, qual
volume há. Responder de memória é o que transforma o portão em carimbo.

## Estágio A — dá para rodar em loop com qualidade?

1. **Tem harness?** Existe verificação sólida para esta tarefa. Sem harness o
   loop erra sem rede.
2. **O retorno é rápido?** O ciclo verificar → corrigir converge a tempo.
3. **O "não" é confiável?** O verificador reprova sem falso positivo. É o que
   impede o plausível-errado: um "sim" só vale quando o "não" vale.
4. **Tem trabalho suficiente?** Volume que justifique a cerimônia.

**Algum não: não é loop.** Faz na mão, ou constrói o harness que falta primeiro,
como tarefa própria.

## Estágio B — pode rodar sozinho?

5. **O estrago é reversível e local?** Efeito irreversível para fora (recurso
   aplicado na nuvem, coisa publicada, dado apagado) pede humano no circuito
   mesmo sendo viável.
6. **A especificação está sem ambiguidade?** Especificação ambígua com ótimo
   "não" produz a coisa errada, bem verificada.

**Algum não: proposta em `openspec/changes/` com humano no circuito.**

## Neste repositório

| tarefa | veredito | por quê |
|---|---|---|
| rodar `testes/unidade.py` em ciclo de correção | **loop** | portão hermético, retorno em segundos |
| medir a ida e volta e corrigir o gerador | **loop, depois que a régua virar portão** | hoje é relatório: o "não" não reprova |
| aplicar célula na AWS | **humano no circuito** | B.5: recurso aplicado não é reversível e local |
| descer peça do catálogo para a instância | **humano no circuito** | B.5: muda o que outro repositório aplica |

## Registro

As seis respostas entram no `tasks.md` da change ANTES da primeira execução, com
o fato ao lado de cada uma. Outro modelo ou outra pessoa confere depois. Isso é
auditoria, não autorização de si mesmo.

## Condições de parada

Mesmo com o portão aprovado, o loop para e devolve ao humano quando: aparece
ambiguidade na especificação, a mudança viola a regra pétrea da ida e volta, ou
**o mesmo sensor falha duas vezes**. Duas falhas do mesmo sensor escalam; não
viram terceira tentativa.

## Verificação

Feito quando as seis respostas estão escritas com fato ao lado, e a decisão
(autônomo / não é loop / humano no circuito) está declarada antes de a primeira
execução começar.
