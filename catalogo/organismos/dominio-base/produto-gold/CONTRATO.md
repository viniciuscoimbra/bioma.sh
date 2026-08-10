<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# produto-gold · organismo

O balde e o catálogo do produto de dado do domínio, com dono. Guarda o que a malha consome.

**Família:** dominio-base  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- balde gold do domínio
- catálogo gold do domínio

## Não cria

- os jobs que materializam o produto (job-produto-gold)
- as tabelas dentro do catálogo (esteira de dados)
- o grant de leitura (contrato do produto)

## Recebe

- chave do domínio
- prefixo e ambiente

## Publica (sítios de ligação)

- arn do balde gold
- nome do catálogo gold

## Premissas

- durabilidade: o produto de dado é o que a malha consome; refazer do zero não devolve o que a origem mudou
- separado de job-produto-gold porque balde e job não nascem nem morrem juntos

## Status

construida (interior escrito e validado com terraform validate)
