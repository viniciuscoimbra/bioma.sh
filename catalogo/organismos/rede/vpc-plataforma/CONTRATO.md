<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# vpc-plataforma · organismo

A rede privada de uma conta de plataforma, por plano, onde vivem barramento, dados e observabilidade.

**Família:** rede  
**Realiza:** 02.2 (instância por plano)  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- VPC da conta de plataforma por plano
- subnets
- attachment

## Não cria

- associação (ligação)

## Recebe

- cidr
- plano
- tgw_id_parameter_arn

## Publica (sítios de ligação)

- vpc_id
- subnet_ids
- attachment_id

## Premissas

- teste local: o emulador cria a VPC sem CIDR do IPAM e não tem attachment de Transit Gateway

## Status

construida (interior escrito e validado com terraform validate)
