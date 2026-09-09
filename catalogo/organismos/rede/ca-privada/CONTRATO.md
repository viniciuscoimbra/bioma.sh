<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->

# ca-privada · organismo

A raiz de confiança TLS para nomes internos (`.internal`/`.interno`), compartilhada por RAM com a Organization; nenhum domínio precisa da própria CA.

**Família:** rede
**Realiza:** 02·D6
**Durabilidade:** permanente
**Custo:** medio
**Teste local:** fora
**Tier de teste:** C

## Cria

- Private CA raiz (ROOT, GENERAL_PURPOSE)
- certificado autoassinado da própria CA
- share por RAM com a OU de workloads

## Não cria

- certificado wildcard de domínio (organismos/rede/certificado-wildcard, na conta consumidora)

## Recebe

- dominio_raiz
- principals

## Publica (sítios de ligação)

- ca_arn
- share_arn

## Premissas

- uma CA só para toda a Organization: revogar/reemitir invalidaria todo certificado wildcard emitido, em toda conta, ao mesmo tempo
- GENERAL_PURPOSE, não SHORT_LIVED_CERTIFICATE: o wildcard do efêmero é permanente, não um certificado de vida curta
- teste local: ACM Private CA não emulado

## Status

construida (interior escrito e validado com terraform validate)
