<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# inspecao-egress · organismo

A saída inspecionada: todo tráfego que sai da organização passa pelo firewall central.

**Família:** rede  
**Realiza:** 02·D1  
**Durabilidade:** estavel  
**Custo:** alto  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- Network Firewall
- VPC de inspeção
- appliance mode
- NAT

## Não cria

- nada a declarar

## Recebe

- plano

## Publica (sítios de ligação)

- nada

## Status

construida (interior escrito e validado com terraform validate)
