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
- log de fluxo e alerta (opcional)

## Não cria

- nada a declarar

## Recebe

- plano
- cidr_inspecao
- azs
- tgw_id
- bloqueio
- postura_default
- grupos_de_regra_arns
- supernet_interna
- dias_de_log

## Publica (sítios de ligação)

- attachment_id
- firewall_arn

## Status

construida (interior escrito e validado com terraform validate)
