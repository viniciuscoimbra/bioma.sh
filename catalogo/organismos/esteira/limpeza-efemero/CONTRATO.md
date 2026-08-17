<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->


# limpeza-efemero · organismo

A guarda de custo e de higiene do efêmero: caça e destrói, por agendamento, o que passou do TTL ou ficou órfão do workflow de encerramento.

**Família:** esteira  
**Realiza:** 15.2 · anatomia do efêmero (destruição por TTL e varredura de sobreviventes)  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** plan-apenas  
**Tier de teste:** B  

## Cria

- funcao-processadora (a varredura)
- EventBridge Scheduler (o relógio)
- role de invocação do scheduler

## Não cria

- o ambiente-efemero em si (organismos/esteira/ambiente-efemero)
- a destruição normal por evento de PR (workflows da esteira)

## Recebe

- ambiente
- ttl_horas
- imagem_inicial

## Publica (sítios de ligação)

(nenhum)

## Premissas

- guarda permanente, e por isso não vive no mesmo módulo do recurso que ela limpa: não deve depender do mesmo sistema que criou o órfão
- Route53 não aceita tag em registro: a varredura de DNS é por PADRÃO DO NOME dentro da zona, não pela Resource Groups Tagging API que cobre os demais recursos
- só destrói recurso etiquetado efemero=preview ou efemero=homologacao cujo prefixo passou do TTL; nunca toca recurso sem essa etiqueta
- teste local: EventBridge Scheduler não emulado

## Status

construida (interior escrito e validado com terraform validate)
