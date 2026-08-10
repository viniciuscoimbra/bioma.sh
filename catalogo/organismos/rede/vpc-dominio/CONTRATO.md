<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# vpc-dominio · organismo

A rede privada de um domínio num ambiente: três zonas, sem internet, com o encaixe no hub.

**Família:** rede  
**Realiza:** 02, 02.2  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- VPC 3 AZs
- subnets privadas
- attachment ao hub
- gateway endpoints S3/DDB
- rota à supernet

## Não cria

- associação/propagação (ligação da rede)

## Recebe

- cidr (IPAM)
- dominio
- ambiente
- tgw_id_parameter_arn

## Publica (sítios de ligação)

- vpc_id
- subnet_ids
- attachment_id (para a ligação)

## Premissas

- teste local: o emulador cria a VPC sem CIDR do IPAM e não tem attachment de Transit Gateway

## Status

construida (interior escrito e validado com terraform validate)
