# Tasks — ambiente efêmero por PR

> **Evidência**: uma task só vira `[x]` com o comando executado e o resultado observável anotados na própria linha.

## 1. O desenho sabe o que é de PR

- [x] 1.1 [fable] Multiplicidade `×pr` no tradutor, com a durabilidade decidida por ela. Dependências: nenhuma. Evidência 2026-08-07: desenho de teste com duas peças `×pr` e uma `compartilhado` na Mesa de Crédito; a proposta saiu com `uma por PR aberta · efemera · efemero_por_pr=True` para as duas, e `uma por plano (nao-prod, prod) · permanente` para a terceira.

## 2. O estado isolado

- [x] 2.1 [opus] Caminho próprio e chave do estado prefixada pela PR. Dependências: 1.1. Evidência 2026-08-07: as peças `×pr` geraram `live/mesa-de-credito/efemero/<célula>/` e a permanente ficou em `nao-prod` e `prod`. No `root.hcl`, `prefixo = local.efemero ? "efemero/pr-${local.pr}" : "permanente"` entra na `key` do backend S3 e no caminho do estado local. A pasta é uma só de propósito: o terragrunt não interpola nome de pasta, e quem separa uma PR da outra é a chave.
- [x] 2.2 [sonnet] Backend S3 opcional, com o local como padrão de quem está desenhando. Dependências: 2.1. Evidência 2026-08-07: `remote_state` alterna por `TG_BALDE_ESTADO`; vazio mantém o estado em disco, preenchido usa S3 com `encrypt` e `use_lockfile`.

## 3. A marca em todo recurso

- [x] 3.1 [sonnet] `default_tags` no provider gerado, com efemeridade, PR, criação e prazo. Dependências: 2.1. Evidência 2026-08-07: o `provider.tf` gerado sai com `default_tags { tags = ${jsonencode(local.marcas)} }`, e `marcas` traz `Origem` sempre, mais `Ephemeral`, `PRNumber`, `CriadoEm` e `TTLHoras` quando `PR_NUMBER` existe.

## 4. A base por leitura

- [x] 4.1 [opus] Peça efêmera lê a permanente por estado remoto, nunca por dependency. Dependências: 1.1. Evidência 2026-08-07: a célula `efemero/lambda-function` saiu com `generate "base"` escrevendo `data "terraform_remote_state" "dynamodb_table"` apontando para `permanente/mesa-de-credito/nao-prod/dynamodb-table/terraform.tfstate`, e nenhum bloco `dependency`. O `include "root"` ganhou `expose = true` para o data source ler o balde e a região.

## 5. A esteira

- [x] 5.1 [fable] Workflow de PR gerado junto da árvore. Dependências: 2.1, 3.1. Evidência 2026-08-07: `.github/workflows/ambiente-efemero.yml` sai quando há stack de PR; YAML validado com três jobs (`subir`, `derrubar`, `faxina`), gatilhos `pull_request` (opened, synchronize, reopened, closed) e `schedule`, escopo `live/mesa-de-credito/efemero` em vez da raiz, e a faxina buscando por `Ephemeral=true` com `CriadoEm` anterior ao limite.

## 6. O que falta para valer numa conta de verdade

- [ ] 6.1 [opus] A role da esteira: gerar a policy com Condition por `aws:RequestTag/Ephemeral` e `aws:ResourceTag/PRNumber`, mais o trust do OIDC do GitHub. Dependências: 3.1. Evidência esperada: a policy gerada e um `terraform plan` recusado ao tentar criar recurso sem a tag.
- [ ] 6.2 [opus] Provar numa conta real: abrir uma PR de teste, ver a stack subir, conferir que o estado permanente não aparece no plano, fechar a PR e conferir que só a stack caiu. Dependências: 5.1, 6.1. Evidência esperada: os dois planos e a saída do destroy.
- [ ] 6.3 [sonnet] A tela mostra a stack de PR: multiplicidade `×pr` na ficha da peça e a receita com o número da PR. Dependências: 5.1. Evidência esperada: a foto da ficha e da receita.
