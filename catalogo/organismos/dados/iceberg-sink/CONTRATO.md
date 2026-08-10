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

- topicos_publicos
- bucket_bronze

## Publica (sítios de ligação)

- nada

## Premissas

- consumidor do barramento, não dependência

## Status

construida (interior escrito e validado com terraform validate)
