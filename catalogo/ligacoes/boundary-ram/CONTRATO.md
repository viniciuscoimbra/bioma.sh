<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# boundary-ram · ligação

Compartilha um recurso publicado (parâmetro, pool) com um território inteiro.

**Dono:** quem publica  
**Teste local:** fora  

## Cria

- aws_ram_resource_share
- resource_association
- principal_association (OU)

## Permissões exigidas

- ram:CreateResourceShare

## Recebe

- resource_arns
- principal_ou

## Premissas

- parâmetro em advanced tier; leitura pelo ARN completo
- teste local: RAM não emulado

## Status

construida (interior escrito e validado com terraform validate)
