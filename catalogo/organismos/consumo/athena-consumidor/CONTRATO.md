<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# athena-consumidor · organismo

A exploração ad-hoc governada: consulta esporádica pagando por varredura.

**Família:** consumo  
**Realiza:** 04  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- workgroup Athena
- results bucket
- query limits

## Não cria

- grants (recebe via acesso-lake)

## Recebe

- plano

## Publica (sítios de ligação)

- nada

## Premissas

- paga por TB varrido; ad-hoc
- teste local: ListTagsForResource do Athena não emulado

## Status

construida (interior escrito e validado com terraform validate)
