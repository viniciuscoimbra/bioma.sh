<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# classificacao-lake · ligação

O dono classifica o próprio produto com o vocabulário da plataforma; o grant por tag só enxerga o que foi classificado.

**Dono:** dono do produto (LF)  
**Teste local:** fora  

## Cria

- atribuição de LF-Tags a banco, tabela e coluna (compilada do contrato)

## Permissões exigidas

- lakeformation:AddLFTagsToResource
- DESCRIBE e ASSOCIATE nas tags compartilhadas pela plataforma

## Recebe

- catalog_id
- tags_catalog_id
- bancos
- tabelas
- colunas

## Premissas

- o vocabulário mora na conta de dados (governanca) e chega por grant
- a tag pii entra depois do PR do contrato; o detector só propõe (04 · Decisão 3)
- teste local: Lake Formation não emulado

## Status

construida (interior escrito e validado com terraform validate)
