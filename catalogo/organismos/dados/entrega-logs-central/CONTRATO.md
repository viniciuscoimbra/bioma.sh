<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# entrega-logs-central · organismo

O funil de logs entre contas: o destino central que recebe as assinaturas de todas as fontes.

**Família:** dados  
**Realiza:** 14.1  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- CloudWatch Logs destination
- access policy das contas fonte
- role do Firehose

## Não cria

- subscriptions (ligação subscricao-logs, por conta fonte)

## Recebe

- contas_fonte

## Publica (sítios de ligação)

- destination_arn

## Premissas

- teste local: PutDestination do CloudWatch Logs não emulado

## Status

construida (interior escrito e validado com terraform validate)
