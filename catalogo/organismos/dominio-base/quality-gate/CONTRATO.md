<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# quality-gate · organismo

O portão de qualidade antes da publicação: o que reprova vai à quarentena, e não ao produto.

**Família:** dominio-base  
**Realiza:** 04  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- Glue Data Quality/SODA gate entre Silver e Gold
- quarentena

## Não cria

- nada a declarar

## Recebe

- regras_do_contrato

## Publica (sítios de ligação)

- métricas

## Premissas

- reprovado vai à quarentena, não publica

## Status

construida (interior escrito e validado com terraform validate)
