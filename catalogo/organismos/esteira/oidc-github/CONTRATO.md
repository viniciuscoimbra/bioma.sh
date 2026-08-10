<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# oidc-github · organismo

O contrato de deploy em cada conta: a confiança com o CI e as roles de planejar e aplicar.

**Família:** esteira  
**Realiza:** 15·D2  
**Durabilidade:** estavel  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** B  

## Cria

- OIDC provider na conta alvo
- role plan
- role apply
- trust restrito por repo/branch

## Não cria

- workflows (artefato)

## Recebe

- conta_alvo
- repos_permitidos

## Publica (sítios de ligação)

- role_arns

## Premissas

- célula de defesa da esteira
- teste local: CreateOpenIDConnectProvider não emulado

## Status

construida (interior escrito e validado com terraform validate)
