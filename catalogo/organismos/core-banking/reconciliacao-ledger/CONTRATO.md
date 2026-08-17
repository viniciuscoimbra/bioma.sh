<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# reconciliacao-ledger · organismo

O auditor interno: compara o livro com o que o core reporta e alarma a divergência.

**Família:** core-banking  
**Realiza:** 05.1  
**Durabilidade:** efemera  
**Custo:** baixo  
**Teste local:** plan-apenas  
**Tier de teste:** B  

## Cria

- comparador independente (Lambda/Glue)
- alarme de divergência

## Não cria

- o store do resultado (evidencia-reconciliacao)

## Recebe

- fontes

## Publica (sítios de ligação)

- métrica divergência

## Premissas

- teste local: célula de aplicacao/, fora do orquestrador

## Status

construida (interior escrito e validado com terraform validate)
