<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# subscricao-logs · ligação

A assinatura que despacha os logs de uma conta para o funil central.

**Dono:** observabilidade  
**Teste local:** plan-apenas  

## Cria

- subscription filter → destination central

## Permissões exigidas

- logs:PutSubscriptionFilter

## Recebe

- destination_arn
- log_groups

## Premissas

- teste local: para no log group que nasce em aplicacao/

## Status

construida (interior escrito e validado com terraform validate)
