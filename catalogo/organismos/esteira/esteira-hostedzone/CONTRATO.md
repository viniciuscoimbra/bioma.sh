<!-- escrito à mão: o gerador regenera a árvore inteira do live e desfaz a poda
     da fase 1, então este contrato não passou por ferramentas/gerar_estrutura.py.
     Ao reincorporar a receita ao inventário, conferir se os dois concordam. -->


# esteira-hostedzone · organismo

A ponte de escrita DNS entre a conta de rede (dona das zonas privadas de não-produção) e as contas de workload dev/hml, sem dar a elas acesso a nenhuma outra zona da conta de rede.

**Família:** esteira
**Realiza:** 15·D2, 15·D7
**Durabilidade:** estavel
**Custo:** baixo
**Teste local:** fora
**Tier de teste:** B

## Cria

- role esteira-hostedzone, na conta dona das zonas privadas de não-produção
- trust cross-account: só as roles esteira-dev/esteira-hml das contas de workload podem assumi-la
- policy escopada a ChangeResourceRecordSets/GetHostedZone só nas zonas dev.interno e hml.interno

## Não cria

- as zonas privadas em si (rede/resolver-dns)
- o registro do prefixo (ambiente-efemero, que assume esta role via papel_dns_arn)

## Recebe

- contas_confiadas
- zona_ids

## Publica (sítios de ligação)

- role_arn

## Premissas

- `ambiente-efemero/variables.tf` (`papel_dns_arn`) e as células `oidc-servico` dos domínios já referenciam o ARN previsível `arn:aws:iam::<conta_network>:role/esteira-hostedzone`
- trust por conta AWS (`aws:PrincipalArn`), não por OIDC do GitHub: quem assume é a role `esteira-dev`/`esteira-hml` já autenticada, não um workflow direto
- teste local: trust cross-account de IAM role não emulado

## Status

construida (interior escrito e validado com terraform validate)
