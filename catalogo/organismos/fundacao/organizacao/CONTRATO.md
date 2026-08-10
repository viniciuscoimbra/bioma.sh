<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# organizacao · organismo

A raiz de tudo: cria a AWS Organization com os tipos de política habilitados.

**Família:** fundacao  
**Realiza:** 00 · guia §3  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- aws_organizations_organization ALL features
- policy types

## Não cria

- contas compartilhadas (landing-zone)

## Recebe

- nada

## Publica (sítios de ligação)

- org_id
- root_id

## Premissas

- state exclusivo
- teste local: CreateOrganization não emulado

## Status

construida (interior escrito e validado com terraform validate)
