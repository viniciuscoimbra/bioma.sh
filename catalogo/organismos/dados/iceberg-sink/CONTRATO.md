<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# iceberg-sink · organismo

A esteira que aterrissa cada tópico público no Bronze, sem cópia manual.

**Família:** dados  
**Realiza:** 04, 01  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- MSK Connect Iceberg Sink (tópico público → Bronze)

## Não cria

- nada a declarar

## Recebe

- plano
- regiao
- plugin (bucket e chave)
- role_conector_arn
- bootstrap_servers
- topicos
- campo_de_rota
- warehouse_bucket_nome
- database_destino
- topico_controle
- registry (nome e regiao)
- rede (subnets, sg)

## Publica (sítios de ligação)

- nada

## Premissas

- consumidor do barramento, não dependência
- catálogo Glue e warehouse no bronze são input obrigatório: conector sem catálogo sobe RUNNING e não escreve
- o tópico de controle nasce pela molécula topico-kafka (auto.create.topics.enable=false no cluster)
- o AVRO dos tópicos é lido do Glue Schema Registry do barramento; leitura entre contas do registry pede política de recurso do Glue naquela conta (confirmar no ambiente)

## Status

construida (interior escrito e validado com terraform validate)
