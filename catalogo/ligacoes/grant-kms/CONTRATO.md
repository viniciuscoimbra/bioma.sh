<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# grant-kms · ligação

Concede a um serviço o uso da chave de um domínio, sem entregar a chave.

**Dono:** seguranca  
**Teste local:** plan-apenas  

## Cria

- aws_kms_grant por serviço consumidor

## Permissões exigidas

- kms:CreateGrant

## Recebe

- key_arn
- grantee_principal

## Premissas

- réplica precisa de grants próprios
- teste local: para na chave multi-region que não aplica no degrau 1

## Status

construida (interior escrito e validado com terraform validate)
