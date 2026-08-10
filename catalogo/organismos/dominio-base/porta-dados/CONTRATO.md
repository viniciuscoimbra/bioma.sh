<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# porta-dados · organismo

O produto de dado publicado: a tabela Gold do domínio, sob contrato, registrada no catálogo central.

**Família:** dominio-base  
**Realiza:** 04.1  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- bucket Gold do domínio
- tabela Iceberg publicada
- registro no catálogo central

## Não cria

- grants (acesso-lake, concedidos pelo dono)

## Recebe

- kms_arn
- contrato_de_dado

## Publica (sítios de ligação)

- tabela_arn

## Premissas

- produto nasce e é dono do domínio
- teste local: Lake Formation não emulado
- durabilidade: o registro no Lake Formation volta igual; o conteúdo mora no balde do produto

## Status

construida (interior escrito e validado com terraform validate)
