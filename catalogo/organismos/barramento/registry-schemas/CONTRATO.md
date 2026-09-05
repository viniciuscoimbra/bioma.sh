<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# registry-schemas · organismo

O cartório dos contratos de evento: cada formato registrado e validado contra quebra.

**Família:** barramento  
**Realiza:** 01.1 §1-§2  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** suportado  
**Tier de teste:** A  

## Cria

- Glue Schema Registry
- política BACKWARD_ALL
- resource policy do Glue para leitores de outra conta (só quando há leitor)

## Não cria

- versões de schema (esteira do produtor)

## Recebe

- plano
- contas_leitoras

## Publica (sítios de ligação)

- registry_arn

## Status

construida (interior escrito e validado com terraform validate)
