<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->

# certificado-wildcard · organismo

O certificado wildcard `*.<zona>` que `organismos/esteira/ambiente-efemero` referencia; permanente, um por conta, nunca recriado por PR.

**Família:** rede
**Realiza:** 02·D6
**Durabilidade:** permanente
**Custo:** baixo
**Teste local:** fora
**Tier de teste:** C

## Cria

- certificado ACM wildcard (*.<zona>), assinado pela CA privada compartilhada

## Não cria

- a CA em si (organismos/rede/ca-privada, na conta network)

## Recebe

- zona_dns_nome
- ca_privada_arn

## Publica (sítios de ligação)

- certificado_arn

## Premissas

- nasce na conta consumidora, nunca na conta network: aws_api_gateway_domain_name exige o certificado na mesma conta e região da API
- cobre TODOS os prefixos de PR/candidato de um domínio+ambiente: um wildcard por conta, não um certificado por PR
- sem validation_method: certificado de CA privada não passa por prova de propriedade de domínio, diferente do ACM público
- teste local: ACM com certificate_authority_arn não emulado

## Status

construida (interior escrito e validado com terraform validate)
