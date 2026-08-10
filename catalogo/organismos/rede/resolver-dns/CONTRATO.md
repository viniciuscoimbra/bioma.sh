<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# resolver-dns · organismo

A resolução privada de nomes por ambiente, com as zonas internas dos domínios.

**Família:** rede  
**Realiza:** 02·D5  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- Resolver endpoints
- regras
- PHZ por ambiente
- associações cross-account por RAM

## Não cria

- nada a declarar

## Recebe

- dominios_dns

## Publica (sítios de ligação)

- zone_ids

## Premissas

- teste local: route53resolver não emulado

## Status

construida (interior escrito e validado com terraform validate)
