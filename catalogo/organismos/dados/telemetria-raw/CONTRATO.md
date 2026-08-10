<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# telemetria-raw · organismo

A telemetria como evidência: o que os sistemas emitem, retido pela régua regulatória.

**Família:** dados  
**Realiza:** 14, 14.1  
**Durabilidade:** permanente  
**Custo:** medio  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- S3 camada raw (retenção por classe)
- Firehose de entrega

## Não cria

- destination de logs (entrega-logs-central)

## Recebe

- kms_arn
- retencoes

## Publica (sítios de ligação)

- bucket_arn

## Premissas

- evidência regulatória

## Status

construida (interior escrito e validado com terraform validate)
