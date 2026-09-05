<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# evidencia-reconciliacao · organismo

O arquivo durável do resultado de cada reconciliação, com retenção regulatória.

**Família:** dominio-base  
**Realiza:** 05.1  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- store durável do resultado da reconciliação
- retenção regulatória

## Não cria

- nada a declarar

## Recebe

- retencao
- nome_legado (opcional: balde que já existe e não pode ser renomeado)

## Publica (sítios de ligação)

- arn

## Premissas

- gate de migração lê daqui

## Status

construida (interior escrito e validado com terraform validate)
