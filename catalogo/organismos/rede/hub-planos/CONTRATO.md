<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# hub-planos · organismo

O hub de trânsito com os três planos de rota (produção, não-produção, compartilhado); produção só fala com produção.

**Família:** rede  
**Realiza:** 02·D1, 02·D5  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- Transit Gateway
- rt-producao
- rt-nao-producao
- rt-compartilhado
- blackholes de cruzamento

## Não cria

- attachments (da VPC de origem)
- associações/propagações (ligação)

## Recebe

- nada

## Publica (sítios de ligação)

- tgw_id (SSM advanced + RAM)
- rt_ids

## Premissas

- cardinalidade ×1
- teste local: CreateTransitGateway não emulado

## Status

construida (interior escrito e validado com terraform validate)
