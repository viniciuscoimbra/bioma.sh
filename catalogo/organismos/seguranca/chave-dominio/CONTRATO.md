<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# chave-dominio · organismo

A chave criptográfica de um domínio num ambiente: primária na residência, réplica na secundária; quem usa recebe grant, nunca a chave.

**Família:** seguranca  
**Realiza:** 03·D3, 00·D3  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- KMS multi-region primária (residência)
- réplica na secundária
- alias
- key policy

## Não cria

- grants (ligação grant-kms)

## Recebe

- dominio
- ambiente

## Publica (sítios de ligação)

- key_arn (SSM+RAM)
- replica_arn

## Premissas

- uma por domínio E ambiente; réplica tem ARN e policy próprios
- teste local: ReplicateKey (chave multi-region) não emulado

## Status

construida (interior escrito e validado com terraform validate)
