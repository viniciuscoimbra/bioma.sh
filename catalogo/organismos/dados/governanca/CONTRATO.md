<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# governanca · organismo

O catálogo técnico e o guarda de acesso: quem lê o quê, por coluna e linha, decidido no plano do dado.

**Família:** dados  
**Realiza:** 04  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- Glue Data Catalog
- Lake Formation (tags, enforcement)
- LF admins
- Glue jobs do Silver (dedupe) e Glue Data Quality como gate do Silver

## Não cria

- grants (ligação acesso-lake)

## Recebe

- nada

## Publica (sítios de ligação)

- catalog_id

## Premissas

- catálogo compilado do contrato, não de crawler
- Gold e o gate do Gold são do domínio produtor (04.1); aqui é o Silver da plataforma
- teste local: Lake Formation não emulado

## Status

construida (interior escrito e validado com terraform validate)
