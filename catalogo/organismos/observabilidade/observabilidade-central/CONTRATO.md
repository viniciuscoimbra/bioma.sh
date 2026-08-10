<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# observabilidade-central · organismo

O centro de observação: painel único, anomalia correlacionada e runbook com alçada.

**Família:** observabilidade  
**Realiza:** 14  
**Durabilidade:** estavel  
**Custo:** medio  
**Teste local:** fora  
**Tier de teste:** C  

## Cria

- OAM sink
- DevOps Guru (delegado)
- SSM Automation runbooks
- EventBridge alarme→runbook

## Não cria

- links das contas fonte (ligação oam-link)
- raw (telemetria-raw, dados)

## Recebe

- nada

## Publica (sítios de ligação)

- sink_arn

## Premissas

- runbook com alçada

## Status

construida (interior escrito e validado com terraform validate)
