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

- Glue Data Catalog (bronze e silver)
- Lake Formation (settings, LF-Tags, registro do bronze e do silver com role própria)
- LF admins
- compartilhamento das LF-Tags com as contas que classificam
- Glue jobs do Silver (dedupe) e Glue Data Quality como gate do Silver

## Não cria

- grants (ligação acesso-lake)
- atribuição de tags a tabela e coluna (ligação classificacao-lake)

## Recebe

- plano
- administradores_arns
- role_jobs_arn
- log_group_jobs
- kms_arn
- buckets_registrados
- lf_tags
- contas_que_classificam
- jobs_silver

## Publica (sítios de ligação)

- catalog_id
- database_bronze
- database_silver
- role_registro_arn
- lf_tags

## Premissas

- catálogo compilado do contrato, não de crawler
- Gold e o gate do Gold são do domínio produtor (04.1); aqui é o Silver da plataforma
- teste local: Lake Formation não emulado

## Status

construida (interior escrito e validado com terraform validate)
