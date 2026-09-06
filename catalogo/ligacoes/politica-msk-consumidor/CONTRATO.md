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

- sufixo
- role_name
- cluster_arn
- topicos_arns
- grupos_arns
- vpc_connection_arn (opcional: vazio para quem chega pelo hub)
- registry_assume_role_arn (opcional: papel leitor do cartório, para quem lê Avro)

## Premissas

- quem cria o ESM precisa de kafka:ListVpcConnections
- teste local: para na role que nasce em aplicacao/

## Status

construida (interior escrito e validado com terraform validate)
