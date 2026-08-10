<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# topico-kafka · molécula

Um assunto do barramento: o canal nomeado onde os eventos de um agregado são publicados, com o contrato de formato registrado no cartório de schemas.

**Blocos:** 01  
**Realiza:** 01.1 §3-§5  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- tópico (provider kafka)
- schema Avro no Glue Registry (BACKWARD_ALL)

## Não cria

- acesso (é ligação politica-msk-*)
- o cluster
- consumer groups (runtime)

## Recebe

- nome
- particoes
- retencao
- schema_avro

## Publica (sítios de ligação)

- arn_topico
- nome_schema

## Premissas

- nome interno <dominio>.<agregado>; público <dominio>.pub.<agregado>-<recorte>.vN
- teste local: o provider kafka não alcança o broker do MSK emulado (bootstrap é IP de contêiner, sem porta no host)

## Status

construida (interior escrito e validado com terraform validate)
