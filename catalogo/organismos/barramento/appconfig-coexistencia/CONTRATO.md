<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# appconfig-coexistencia · organismo

O painel de flags operacionais que decide, por requisição, qual executor atende durante a migração de cores.

**Família:** barramento  
**Realiza:** 01.1 §11  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** B  

## Cria

- AppConfig app/env/profile de flags de roteamento

## Não cria

- regra de negócio (fora do store)

## Recebe

- flags iniciais

## Publica (sítios de ligação)

- app_id

## Status

construida (interior escrito e validado com terraform validate)
