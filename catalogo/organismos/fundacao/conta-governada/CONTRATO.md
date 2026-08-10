<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# conta-governada · organismo

Uma conta de domínio ou plataforma nascendo no território certo, com tags e contatos, aguardando o enrollment assíncrono.

**Família:** fundacao  
**Realiza:** 00·D1, guia §3 camada 3  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- uma conta (compõe molecula conta)

## Não cria

- enrollment (gate assíncrono da esteira)

## Recebe

- nome
- email
- ou

## Publica (sítios de ligação)

- account_id

## Premissas

- gate: ListEnabledBaselines --include-children + GetEnabledBaseline
- teste local: CreateAccount do Organizations não emulado

## Status

construida (interior escrito e validado com terraform validate)
