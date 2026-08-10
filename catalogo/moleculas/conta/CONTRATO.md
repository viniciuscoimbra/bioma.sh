<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# conta · molécula

O ato de criar uma conta AWS governada dentro da Organization, com as proteções contra encerramento acidental.

**Blocos:** 00  
**Realiza:** 00·D1  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- aws_organizations_account
- close_on_deletion=false + prevent_destroy
- contatos alternativos
- tags de alocação

## Não cria

- o enrollment (Control Tower, assíncrono)
- recursos internos da conta

## Recebe

- nome
- email
- ou_id
- tags

## Publica (sítios de ligação)

- account_id

## Premissas

- encerramento só por workflow próprio
- teste local: Organizations não emulado

## Status

construida (interior escrito e validado com terraform validate)
