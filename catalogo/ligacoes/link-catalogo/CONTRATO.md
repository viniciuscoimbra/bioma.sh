<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# link-catalogo · ligação

Faz o banco compartilhado aparecer no catálogo de quem consome, para o Athena e o Redshift o enxergarem.

**Dono:** consumidor  
**Teste local:** suportado  

## Cria

- resource link no catálogo da conta consumidora apontando o banco do produtor

## Permissões exigidas

- glue:CreateDatabase na conta consumidora
- grant do Lake Formation já concedido pelo dono (acesso-lake)

## Recebe

- links (nome local => conta dona, banco, regiao)

## Premissas

- o link não concede nada: sem o grant do dono ele aponta para um banco que o consumidor não lê

## Status

construida (interior escrito e validado com terraform validate)
