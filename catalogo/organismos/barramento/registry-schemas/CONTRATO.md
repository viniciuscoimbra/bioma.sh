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
- papel leitor que as contas de fora assumem (só quando há leitor; o Schema Registry não aceita resource policy)

## Não cria

- versões de schema (esteira do produtor)

## Recebe

- plano
- contas_leitoras
- contas_escritoras

## Publica (sítios de ligação)

- registry_arn
- papel_leitor_arn
- papel_escritor_arn

## Status

construida (interior escrito e validado com terraform validate)
