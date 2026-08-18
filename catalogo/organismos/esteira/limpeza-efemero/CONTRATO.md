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
- zona_dns_id

## Publica (sítios de ligação)

(nenhum)

## Premissas

- guarda permanente, e por isso não vive no mesmo módulo do recurso que ela limpa: não deve depender do mesmo sistema que criou o órfão
- Route53 não aceita tag em registro: a varredura de DNS é por PADRÃO DO NOME dentro da zona, não pela Resource Groups Tagging API que cobre os demais recursos
- só destrói recurso etiquetado efemero=preview ou efemero=homologacao cujo prefixo passou do TTL; nunca toca recurso sem essa etiqueta
- em DNS, a policy só alcança a zona recebida em zona_dns_id: nenhuma outra zona da conta é alterável pela varredura
- LIMITAÇÃO ACEITA: a varredura destrói função, alias, API e registro DNS, mas não o log group nem a role IAM que funcao-processadora cria por preview; a policy não carrega logs:DeleteLogGroup nem iam:DeleteRole porque o código da imagem de varredura (fora deste repositório) não os chama. Órfãos de log e de role acumulam até o destroy normal por evento de PR, e a quota de roles da conta é o teto prático; ensinar a varredura a apagá-los pede mudança na imagem antes da permissão.
- teste local: EventBridge Scheduler não emulado

## Status

construida (interior escrito e validado com terraform validate)
