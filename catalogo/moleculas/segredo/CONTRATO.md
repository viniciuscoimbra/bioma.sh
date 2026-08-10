<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# segredo · molécula

O cofre de uma credencial de canal externo, com rotação; o valor nunca nasce do código.

**Blocos:** 03, 05, 06  
**Realiza:** credenciais de canal externo  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- aws_secretsmanager_secret
- política de rotação
- resource policy

## Não cria

- o valor (entra por canal próprio, nunca pela receita)

## Recebe

- nome
- kms_key_arn
- dias_rotacao

## Publica (sítios de ligação)

- arn_segredo

## Status

construida (interior escrito e validado com terraform validate)
