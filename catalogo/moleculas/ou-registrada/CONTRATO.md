<!-- gerado por ferramentas/gerar_estrutura.py a partir de inventario.json; edite o inventário, não este arquivo -->


# ou-registrada · molécula

Uma unidade organizacional criada e registrada no Control Tower, pronta para receber contas.

**Blocos:** 00  
**Realiza:** 00·D1  
**Durabilidade:** permanente  
**Custo:** baixo  
**Teste local:** fora  
**Tier de teste:** A  

## Cria

- aws_organizations_organizational_unit
- aws_controltower_baseline 5.0 (registro)

## Não cria

- baseline na Security OU (excluída)

## Recebe

- nome
- parent_id
- baseline_do_pai

## Publica (sítios de ligação)

- ou_id
- ou_arn

## Premissas

- pai antes das filhas; parallelism 1

## Status

construida (interior escrito e validado com terraform validate)
