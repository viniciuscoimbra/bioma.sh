<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# endpoints-centrais · organismo

Os pontos de acesso privados a serviços AWS para quem chega roteado pelo hub.

**Família:** rede  
**Realiza:** 02·D7  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** plan-apenas  
**Tier de teste:** C  

## Cria

- interface endpoints compartilhados na VPC de rede

## Não cria

- gateway endpoints (na vpc de cada consumidor)

## Recebe

- servicos

## Publica (sítios de ligação)

- endpoint_dns

## Premissas

- origem roteada usa interface
- teste local: para na VPC que não aplica no degrau 1

## Status

construida (interior escrito e validado com terraform validate)
