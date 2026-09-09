<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->

# conexao-dxgw · organismo

O caminho até uma rede alcançada por Direct Connect Gateway de terceiro: um Transit Gateway próprio do domínio, porque o hub não chega lá: a AWS não roteia peering de TGW para attachment de DXGW, e a associação direta é recusada quando hub e DXGW compartilham ASN.

**Família:** rede
**Realiza:** decisão registrada em docs/pendencias-da-referencia.md (TGW dedicado por domínio quando o caminho é DXGW de terceiro)
**Durabilidade:** estavel
**Custo:** medio
**Teste local:** fora
**Tier de teste:** C

## Cria

- Transit Gateway dedicado (ASN declarado, sem default)
- três sub-redes /28 de attachment, uma por zona
- attachment da VPC do domínio
- rota de ida na tabela de cada camada declarada

## Não cria

- a associação do DXGW ao TGW (a proposta sai por chamada, o aceite é do dono do DXGW; fronteira rtm-banco-central)
- as rotas de volta (chegam por BGP e são propagadas)
- regra de segurança (é da célula da carga, como a servidores-fila)

## Recebe

- nome, dominio, ambiente
- asn (obrigatório: colidir com o ASN do DXGW recusa a associação)
- vpc_id e cidrs_tgw (três /28)
- route_table_ids (de route_table_ids_por_camada da vpc-dominio)
- destinos (as faixas da rede de lá)

## Publica

- tgw_id (a proposta de associação aponta para ele)
- attachment_id
- subnet_ids

## Premissas

- cardinalidade ×1 por conexão de terceiro
- teste local: CreateTransitGateway não emulado
- durabilidade: perder o TGW reabre o aceite na conta do terceiro
