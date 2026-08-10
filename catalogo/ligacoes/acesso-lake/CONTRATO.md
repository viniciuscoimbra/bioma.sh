<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# acesso-lake · ligação

Concede a um consumidor a leitura de um produto de dado, no recorte permitido.

**Dono:** dono do produto (LF)  
**Teste local:** fora  

## Cria

- lakeformation grants por tag/coluna/linha

## Permissões exigidas

- lakeformation:GrantPermissions

## Recebe

- tabela
- consumidor
- recorte

## Premissas

- teste local: Lake Formation não emulado

## Status

construida (interior escrito e validado com terraform validate)
