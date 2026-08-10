<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# dlt-inspecao · organismo

O hospital dos eventos defeituosos: consome o tópico de mortos, materializa para inspeção humana e agenda o reprocesso do transitório.

**Família:** barramento  
**Realiza:** 01.1 §8  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- consumer DLT (funcao-processadora)
- tabela DynamoDB dos eventos mortos
- EventBridge Scheduler do redrive

## Não cria

- o DLT em si (topico-kafka)

## Recebe

- dlt_topicos

## Publica (sítios de ligação)

- nada

## Premissas

- redrive só transitório; veneno espera humano

## Status

construida (interior escrito e validado com terraform validate)
