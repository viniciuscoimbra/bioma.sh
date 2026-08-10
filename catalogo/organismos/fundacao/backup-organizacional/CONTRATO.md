<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# backup-organizacional · organismo

A cópia de segurança da organização: planos, cofre na residência e cofre na região secundária cifrado com a chave réplica.

**Família:** fundacao  
**Realiza:** 00·D3  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- backup plans org
- vault primário
- vault secundário na outra região
- cofre com chave réplica multi-region

## Não cria

- as chaves (chave-dominio, da segurança)

## Recebe

- kms_arns por domínio
- retenções

## Publica (sítios de ligação)

- vault_arns

## Premissas

- recurso sem criptografia independente exige CMK no vault destino
- teste local: PutBackupVaultLockConfiguration não emulado

## Status

construida (interior escrito e validado com terraform validate)
