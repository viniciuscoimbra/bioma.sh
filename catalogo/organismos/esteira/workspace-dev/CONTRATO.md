<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# workspace-dev · organismo

A estação de trabalho remota do desenvolvedor: o código nunca mora no laptop.

**Família:** esteira  
**Realiza:** 15·D8  
**Durabilidade:** efemera  
**Custo:** medio  
**Teste local:** plan-apenas  
**Tier de teste:** B  

## Cria

- EC2 workspace
- Session Manager
- Docker local
- TTL

## Não cria

- nada a declarar

## Recebe

- dev
- tamanho

## Publica (sítios de ligação)

- nada

## Premissas

- uma unit por desenvolvedor; só conta dev
- teste local: célula de aplicacao/, fora do orquestrador

## Status

construida (interior escrito e validado com terraform validate)
