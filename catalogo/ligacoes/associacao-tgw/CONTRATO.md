<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# associacao-tgw · ligação

Liga o encaixe de uma VPC ao plano de rota certo no hub; o ato que decide em qual mundo aquela rede vive.

**Dono:** rede  
**Teste local:** fora  

## Cria

- aws_ec2_transit_gateway_route_table_association
- aws_ec2_transit_gateway_route_table_propagation

## Permissões exigidas

- ec2:AssociateTransitGatewayRouteTable
- ec2:EnableTransitGatewayRouteTablePropagation

## Recebe

- attachment_id (do dono da VPC, por hormônio)
- route_table_id (do hub)

## Premissas

- uma execução, um state, duas permissões declaradas; plano errado é o incidente que a revisão por PR impede
- teste local: Transit Gateway não emulado

## Status

construida (interior escrito e validado com terraform validate)
