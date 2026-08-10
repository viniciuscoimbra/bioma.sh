<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# vpn-acesso · organismo

A porta de entrada humana: VPN única com autorização por grupo, só para não-produção.

**Família:** rede  
**Realiza:** 02·D6  
**Durabilidade:** estavel  
**Custo:** alto  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- Client VPN
- VPC de terminação 100.64.16.0/24
- autorização por grupo
- rotas de retorno

## Não cria

- nada a declarar

## Recebe

- cidr_clientes
- grupos

## Publica (sítios de ligação)

- endpoint_vpn

## Premissas

- só não-produção

## Status

construida (interior escrito e validado com terraform validate)
