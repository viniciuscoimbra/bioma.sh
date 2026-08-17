<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# consumo-saga · organismo

O ouvido e o braço do domínio: consome comandos do barramento e conduz cada um até o core pela saga, com retry e compensação.

**Família:** core-banking  
**Realiza:** 05·D5  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- funcao-processadora + ESM
- Step Functions (task token)
- DLT runtime

## Não cria

- a conexão MSK (ligação msk-conexao-privada)

## Recebe

- conexao_arn
- topicos

## Publica (sítios de ligação)

- nada

## Premissas

- teste local: o ESM emulado aceita só SQS, Kinesis e DynamoDB Streams

## Status

construida (interior escrito e validado com terraform validate)
