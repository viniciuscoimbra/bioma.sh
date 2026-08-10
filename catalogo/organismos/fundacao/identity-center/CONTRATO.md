<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# identity-center · organismo

O acesso humano federado: conjuntos de permissão e atribuições por grupo, com usuários e grupos vindos do IdP corporativo.

**Família:** fundacao  
**Realiza:** 00, 03·D1  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- permission sets
- assignments de contas-membro (no delegado)
- conjunto mínimo da management (na management)

## Não cria

- usuários e grupos (IdP via SCIM)

## Recebe

- grupos do IdP
- matriz grupo×conta

## Publica (sítios de ligação)

- nada

## Premissas

- durabilidade: conjuntos e atribuições voltam iguais pela receita

## Status

construida (interior escrito e validado com terraform validate)
