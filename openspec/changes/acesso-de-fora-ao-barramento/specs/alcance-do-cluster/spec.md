## ADDED Requirements

### Requirement: A VPC de fora das faixas do cluster alcança a conexão multi-VPC
O organismo do cluster SHALL aceitar `cidrs_vpc_connectivity`, a lista das VPCs
que conectam pela conexão multi-VPC e estão fora das faixas que o grupo de
segurança já aceita. Cada CIDR declarado SHALL ganhar uma regra de entrada em
14001-14100, que é a faixa em que cada broker atende a conexão privada.

#### Scenario: VPC de conta fora da organização
- **WHEN** a célula declara o CIDR da VPC onde a conexão multi-VPC nasce
- **THEN** o grupo do cluster aceita a entrada dela em 14001-14100, e o
  bootstrap da conexão completa o handshake

#### Scenario: Célula que não declara VPC de fora
- **WHEN** a lista está vazia
- **THEN** nenhuma regra nova é gerada, e o grupo fica como era

### Requirement: Origem da conexão multi-VPC é CIDR IPv4 de /16 ou mais específica
Cada entrada de `cidrs_vpc_connectivity` SHALL ser um CIDR IPv4, e o prefixo
SHALL ser `/16` ou mais específico, que é o mesmo piso das origens do endpoint na
VPC de domínio.

#### Scenario: Prefixo mais curto que o piso
- **WHEN** a célula declara uma faixa `/8`
- **THEN** o plano é recusado, porque abriria os brokers a uma supernet inteira

#### Scenario: Valor que não é CIDR
- **WHEN** a célula declara um endereço sem máscara
- **THEN** o plano é recusado, nomeando a variável e o formato esperado
