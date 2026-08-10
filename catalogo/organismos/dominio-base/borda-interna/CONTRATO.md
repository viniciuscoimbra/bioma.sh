<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# borda-interna · organismo

A porta interna dos ambientes de teste: o balanceador e a zona curinga que servem os previews por PR.

**Família:** dominio-base  
**Realiza:** 15.2 §3  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- ALB compartilhado
- zona wildcard *.<dominio>.<amb>
- regra por host header

## Não cria

- registros por PR (esteira)

## Recebe

- vpc_id
- subnet_ids
- dominio_dns

## Publica (sítios de ligação)

- alb_arn
- zone_id

## Premissas

- só dev e homolog

## Status

construida (interior escrito e validado com terraform validate)
