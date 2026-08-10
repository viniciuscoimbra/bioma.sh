<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# scp · molécula

Uma política de controle de serviço parametrizada: o teto que desce sobre um território.

**Blocos:** 00, 03  
**Realiza:** 00·D2, 03·D5  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- aws_organizations_policy
- attachment parametrizado

## Não cria

- region deny (controle gerenciado CT.MULTISERVICE.PV.1, pendente sandbox)

## Recebe

- nome
- policy_json
- target_id

## Publica (sítios de ligação)

- policy_id

## Premissas

- teto 10 por OU; canário antes de produção
- teste local: Organizations não emulado

## Status

construida (interior escrito e validado com terraform validate)
