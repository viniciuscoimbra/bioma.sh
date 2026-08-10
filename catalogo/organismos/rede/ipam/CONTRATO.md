<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# ipam · organismo

O plano de endereçamento: pools hierárquicos por ambiente e domínio, de onde todo CIDR é alocado; ninguém escolhe endereço à mão.

**Família:** rede  
**Realiza:** 02·D5  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- VPC IPAM
- pools por ambiente e domínio (10.1/10.65/10.129)
- shares RAM dos pools

## Não cria

- nada a declarar

## Recebe

- supernets

## Publica (sítios de ligação)

- pool_ids (por hormônio)

## Premissas

- cardinalidade ×1 (org)
- teste local: CreateIpam não emulado

## Status

construida (interior escrito e validado com terraform validate)
