<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# msk-conexao-privada · ligação

O cabo entre contas: a conexão privada que nasce na conta consumidora, e que o consumidor aponta no lugar do cluster.

**Dono:** domínio consumidor (nasce na conta dele)  
**Teste local:** fora  

## Cria

- managed VPC connection ao cluster

## Permissões exigidas

- kafka:CreateVpcConnection

## Recebe

- cluster_arn
- vpc_id
- subnets

## Premissas

- ESM aponta o ARN da conexão; multi-VPC exige Provisioned e mesma região

## Status

construida (interior escrito e validado com terraform validate)
