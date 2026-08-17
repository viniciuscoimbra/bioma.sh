<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# consumo-decisao · organismo

A entrada da mesa: consome propostas do barramento e inicia o motor.

**Família:** mesa-credito  
**Realiza:** 06  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- funcao-processadora + ESM de propostas
- StartExecution no motor

## Não cria

- conexão MSK (ligação)

## Recebe

- conexao_arn
- topico

## Publica (sítios de ligação)

- nada

## Premissas

- teste local: o ESM emulado aceita só SQS, Kinesis e DynamoDB Streams

## Status

construida (interior escrito e validado com terraform validate)
