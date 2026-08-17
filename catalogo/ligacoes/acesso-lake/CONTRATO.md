<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# acesso-lake · ligação

Concede a um consumidor a leitura de um produto de dado, no recorte permitido.

**Dono:** dono do produto (LF)  
**Teste local:** fora  

## Cria

- lakeformation grants por tabela nomeada
- grants por expressão de LF-Tags
- Data Cells Filters (predicado de linha e recorte de coluna) com o SELECT sobre o filtro

## Permissões exigidas

- lakeformation:GrantPermissions

## Recebe

- grants
- grants_por_tag
- filtros_de_linha

## Premissas

- teste local: Lake Formation não emulado

## Status

construida (interior escrito e validado com terraform validate)
