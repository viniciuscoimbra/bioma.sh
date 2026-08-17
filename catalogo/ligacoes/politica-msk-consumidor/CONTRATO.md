<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# politica-msk-consumidor · ligação

O lado do consumidor: a permissão da role que lê, incluindo enxergar a conexão privada.

**Dono:** domínio consumidor  
**Teste local:** plan-apenas  

## Cria

- identity policy: Connect/Describe/Read + kafka:DescribeVpcConnection

## Permissões exigidas

- iam:PutRolePolicy

## Recebe

- role
- cluster_arn
- topicos
- vpc_connection_arn (opcional: vazio para quem chega pelo hub)

## Premissas

- quem cria o ESM precisa de kafka:ListVpcConnections
- teste local: para na role que nasce em aplicacao/

## Status

construida (interior escrito e validado com terraform validate)
