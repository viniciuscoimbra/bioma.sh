<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# landing-zone · organismo

A fundação governada: Security OU, contas de auditoria e log, roles de serviço, chave raiz e a landing zone do Control Tower, sob um dono único.

**Família:** fundacao  
**Realiza:** 00 · guia §3 camada 2  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** D  

## Cria

- Security OU
- contas Audit e Log Archive
- roles de serviço na management
- KMS raiz
- LZ 4.0 com remediation_types

## Não cria

- recursos internos do Control Tower (dele)

## Recebe

- manifest aprovado
- emails

## Publica (sítios de ligação)

- arns de baseline (via SSM)

## Premissas

- módulo mantido dono único; TF≥1.11; provider ≥6.40

## Status

planejada (contrato definido; interior por construir)
