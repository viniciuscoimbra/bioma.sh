<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# banco-aurora · molécula

Banco relacional gerenciado para store transacional de domínio; a base dos stores que guardam o que não pode se perder.

**Blocos:** 05, 06  
**Realiza:** stores transacionais  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** plan-apenas  
**Tier de teste:** C  

## Cria

- aws_rds_cluster Aurora PostgreSQL
- parameter group próprio
- deletion_protection

## Não cria

- schema e tabelas (esteira de migração)
- o valor de segredo
- réplicas de leitura sem input

## Recebe

- nome
- kms_key_arn (da chave do domínio, por hormônio)

## Publica (sítios de ligação)

- endpoint
- cluster_arn
- reader_endpoint
- segredo_arn
- segredo_nome
- porta

## Premissas

- pg_audit por input
- teste local: Aurora emulado com Postgres em contêiner de verdade; a célula que compõe para na subnet da VPC

## Status

construida (interior escrito e validado com terraform validate)
