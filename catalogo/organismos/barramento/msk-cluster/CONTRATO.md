<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# msk-cluster · organismo

O barramento de eventos em si: o cluster Kafka gerenciado, por plano, com autenticação por identidade.

**Família:** barramento  
**Realiza:** 01, 01.1 §6  
**Durabilidade:** estavel  
**Custo:** alto  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- MSK Provisioned 3 AZ
- IAM auth
- cluster policy base
- multi-VPC connectivity (pós-ACTIVE)

## Não cria

- tópicos (topico-kafka)
- conexões (ligação msk-conexao-privada, na conta consumidora)

## Recebe

- plano
- subnet_ids
- kms_arn

## Publica (sítios de ligação)

- cluster_arn (SSM+RAM)
- bootstrap

## Premissas

- Provisioned; Kafka ≥2.7.1; Serverless excluído (caminho entre contas)
- teste local: CreateCluster emulado com Redpanda de verdade, CreateConfiguration não

## Status

construida (interior escrito e validado com terraform validate)
