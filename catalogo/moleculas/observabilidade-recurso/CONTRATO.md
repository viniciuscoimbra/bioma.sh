<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# observabilidade-recurso · molécula

O padrão mínimo de telemetria que toda receita embute: alarmes e painel do próprio recurso.

**Blocos:** 14  
**Realiza:** padrão de telemetria embutível  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** A  

## Cria

- alarmes padrão do recurso
- dashboard mínimo

## Não cria

- sinks e agregação (observabilidade-central)

## Recebe

- nome_recurso
- namespace
- limiares

## Publica (sítios de ligação)

- nada

## Premissas

- defaults do módulo-base

## Status

construida (interior escrito e validado com terraform validate)
