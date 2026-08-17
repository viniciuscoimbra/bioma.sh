<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# redshift-consumidor · organismo

O motor do BI recorrente: lê o produto de dado sem cópia, com custo previsível.

**Família:** consumo  
**Realiza:** 04  
**Durabilidade:** estavel  
**Custo:** alto  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- Redshift Serverless workgroup
- namespace
- role de acesso ao lake (GetDataAccess + catálogo local), default do namespace

## Não cria

- nada a declarar

## Recebe

- rpu_max
- recursos_do_catalogo

## Publica (sítios de ligação)

- endpoint
- role_lake_arn

## Premissas

- só produção; BI recorrente via Spectrum

## Status

construida (interior escrito e validado com terraform validate)
