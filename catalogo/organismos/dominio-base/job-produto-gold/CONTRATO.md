<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# job-produto-gold · organismo

Os jobs que materializam o produto de dado a partir do silver da plataforma.

**Família:** dominio-base  
**Realiza:** 04.1  
**Durabilidade:** efemera  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- jobs Glue do produto gold

## Não cria

- o balde e o catálogo do produto (produto-gold)
- as tabelas dentro do catálogo (esteira de dados)

## Recebe

- arn do balde gold
- nome do catálogo gold
- role dos jobs

## Publica (sítios de ligação)

- nada

## Premissas

- roda na conta do produtor
- durabilidade: job se refaz sem perda; o que ele grava mora em produto-gold

## Status

construida (interior escrito e validado com terraform validate)
