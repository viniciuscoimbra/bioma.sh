# Rodar a árvore na mão

Para quem tem uma árvore gerada e quer aplicá-la sem passar pela tela. Tudo aqui
foi medido em 2026-08-10 contra a árvore do desenho de referência
(`testes/arvore_referencia.py`), com Terragrunt 1.1.2 e Terraform 1.15.8.

## O `bioma.sh` não aplica

Ele imprime a receita e para (`bioma.sh:374-385`). Criar, atualizar e destruir é
do time que opera, com a credencial dele. Só `--plan` executa alguma coisa.

Duas consequências medidas, que são a razão deste documento existir:

- **As fases não enxergam a árvore gerada.** As fases 2 a 6 procuram
  `fundacao/00-organizacao`, `plataforma/rede/org`, `plataforma/seguranca`,
  `core-banking/dev/base` (`bioma.sh:443-497`). O gerador escreve
  `live/<trilho>/<alcance>/<nome>` (`gerar_iac.py:10`). Diretório inexistente é
  registrado e pulado em silêncio (`bioma.sh:353`), então `./bioma.sh --perfil
  sandbox` não imprime receita nenhuma para as fases 3 a 6.
- **A fase 2 para no gate antes de imprimir.** O gate de baseline chama
  `controltower:ListEnabledBaselines` de verdade. Credencial sem essa permissão
  derruba a execução inteira.

O que funciona hoje é `--area`, com o caminho dentro do `live/`:

```bash
BIOMA_INFRA=/caminho/da/arvore ./bioma.sh --perfil sandbox --area live/plataforma/nao-prod
```

Isso imprime o `terragrunt run --all` já com os `--queue-exclude-dir` que o
perfil manda excluir. O resto deste documento é o mesmo caminho, sem o
intermediário.

## O que a árvore tem dentro

```
<arvore>/
  catalogo/organismos/<trilho>/<nome>/   as receitas: versions.tf main.tf variables.tf outputs.tf
  catalogo/ligacoes/<nome>/              o que atravessa conta, com state próprio
  catalogo/fronteiras/<nome>/            o que não é seu: só o contrato
  live/root.hcl                          backend e provider que toda célula herda
  live/<trilho>/<alcance>/<nome>/        terragrunt.hcl de cada célula
```

Todo comando de terragrunt roda de dentro de `live/`, nunca da raiz.

## Antes de rodar

| Ferramenta | Versão | Por quê |
|---|---:|---|
| Terraform | 1.11 ou maior | lockfile nativo no S3 |
| Terragrunt | 0.80 ou maior | `run --all`, `--queue-exclude-dir` |

O ambiente que o `live/root.hcl` lê:

```bash
export AWS_DEFAULT_REGION=sa-east-1
export TG_MODO=aws                          # `local` fala com o Floci em vez da AWS
export TG_BALDE_ESTADO=tfstate-<sua-conta>  # vazio mantém o estado em disco
export TF_PLUGIN_CACHE_DIR=~/.terraform.d/plugin-cache
```

`TF_PLUGIN_CACHE_DIR` não é enfeite. O provider da AWS pesa 700 MB e cada célula
baixaria o dela; sem cache comum o primeiro plano estoura o tempo antes de
planejar coisa alguma.

Com `TG_BALDE_ESTADO` vazio, o estado fica em
`live/.estado/permanente/<trilho>/<alcance>/<nome>/terraform.tfstate`. Serve para
desenhar. Não serve para dois operadores.

## 1. Preencher o que está `PREENCHER`

Abra cada `terragrunt.hcl` e procure `PREENCHER`. Cada linha traz a pergunta em
português ao lado:

```hcl
inputs = {
  rds_cluster_engine                  = "PREENCHER" # O valor de rds cluster engine
  db_subnet_group_subnet_ids          = "PREENCHER" # O valor de db subnet group subnet ids
}
```

O que sobra como `PREENCHER` é de três tipos, e vale saber qual é qual:

1. **Escolha sua.** `engine`, `instance_class`. Nenhum estado tem isso porque
   ninguém provisiona: é decisão.
2. **Referência a outra célula que o desenho não ligou.** `subnet_ids` é da VPC.
   A VPC existe, mas sem seta desenhada o gerador não escreve `dependency` e
   pergunta. Desenhar a seta é melhor que colar o id.
3. **Buraco na tabela de ligações internas.** O valor está na própria receita e
   deveria ter sido ligado sozinho. Isso é defeito, e o lugar de consertar é
   `LIGACOES_INTERNAS` em `gerar_iac.py`, não o arquivo gerado.

Confira o tipo declarado em `variables.tf` antes de preencher.
`db_subnet_group_subnet_ids` é `list(string)`, e o `"PREENCHER"` que sai é
string: colar um texto ali reprova no plano por tipo.

## 2. Conferir sem tocar a nuvem

```bash
cd <arvore>/live

terragrunt hcl validate     # sintaxe e referências de todas as células
terragrunt find             # lista as células, uma por linha (terragrunt 1.x)
terragrunt dag graph        # a ordem, em dot (terragrunt 1.x)
```

`hcl validate` avisa quando uma célula depende de outra que ainda não tem saída e
usa `mock_outputs`. Isso é o esperado antes do primeiro apply, e é para isso que
o mock existe.

## 3. Uma célula

```bash
cd <arvore>/live/plataforma/nao-prod/lambda-function

terragrunt init
terragrunt plan
terragrunt apply
```

Célula isolada exige que as de cima já estejam aplicadas. O `mock_outputs` cobre
o `plan`, e só ele: `mock_outputs_allowed_terraform_commands` lista `validate`,
`plan` e `init`. Se a origem não subiu, o apply falha em vez de aplicar valor
falso.

## 4. Uma área inteira

```bash
cd <arvore>/live/plataforma/nao-prod

terragrunt run --all apply --non-interactive --parallelism 4 --backend-bootstrap
```

`--backend-bootstrap` cria o balde de estado, e só faz sentido com `TG_MODO=aws`.
`--parallelism 4` é célula em paralelo; cada uma sobe o provider inteiro, e
quatro é onde a memória aguenta.

Para excluir um pedaço, `--queue-exclude-dir <caminho>` por diretório de célula.
O glob não desce sozinho: excluir o ancestral não exclui os filhos.

## 5. A fundação

**A fundação ainda não sai do gerador.** Hoje ele escreve átomo cru no lugar dos
organismos do catálogo, e é o que a change `fundacao-vem-do-desenho` conserta.
Esta seção vale para quem opera uma árvore de instância, onde as unidades abaixo
existem escritas à mão.

Ordem da fase 2, que é sequencial e tem dois pontos de parada:

| Ordem | Unidade | Depois dela |
|---:|---|---|
| 00 | organizacao | |
| 01 | landing-zone | **gate de baseline** |
| 02 | ous | |
| 03 | scp | |
| 04 | contas | **gate de baseline** |
| 05 | delegated-admins | |
| 06 | baseline-seguranca | |
| 07 | identity-center | |
| 08 | backup | |

**`01-landing-zone` está por construir.** O interior dela é módulo de terceiro e
a escolha entre o da Gruntwork e o `mcaf-landing-zone` é decisão humana que
ainda não foi tomada. A fase para aí. Aplicar `00-organizacao` e pular para
`02-ous` deixa a conta sem as contas compartilhadas e sem o Control Tower, e o
gate abaixo vai reprovar.

**O gate, na mão:**

```bash
aws controltower list-enabled-baselines --include-children --output json \
  | jq '{total: (.enabledBaselines|length),
         ok: ([.enabledBaselines[] | select(.statusSummary.status=="SUCCEEDED")]|length)}'
```

Total e ok têm que bater, e total tem que ser maior que zero. Enrollment de conta
é assíncrono: apply concluído não é conta pronta. Seguir sem esse gate cria OIDC
e recurso numa conta que ainda não terminou de nascer.

**As OUs sobem uma de cada vez:**

```bash
cd <arvore>/fundacao/02-ous
terragrunt apply -parallelism=1
```

O registro de baseline do Control Tower roda uma OU por vez, e as OUs são
`for_each` dentro de uma célula só. O `--parallelism` do terragrunt é célula em
paralelo e não serve aqui: quem serializa recurso é o `-parallelism` do
terraform, com um traço.

Isso ainda é passo manual. A célula gerada vai passar a carregar a flag sozinha
quando a task 2.7 de `openspec/changes/fundacao-vem-do-desenho/` fechar.

## 6. Destruir

Antes de destruir qualquer coisa, olhe o `contrato.json` do organismo que a
célula aponta:

- `durabilidade: permanente` guarda dado que só existe ali. Não cai por este
  caminho. Corrigir é para a frente.
- `durabilidade: estavel` cai com janela combinada.
- `durabilidade: efemera` cai por rotina.

```bash
terragrunt run --all destroy --non-interactive --queue-exclude-dir <o que não cai>
```

Célula permanente tem `prevent_destroy = true` no `main.tf`, e o terraform
recusa. A trava é do código gerado, não do orquestrador, e por isso vale em
qualquer esteira.

## 7. Modo local, sem AWS

```bash
docker compose -f testes/docker-compose.yml up -d
export TG_MODO=local BIOMA_EMULADOR=http://localhost:4566
export AWS_ACCESS_KEY_ID=teste AWS_SECRET_ACCESS_KEY=teste
```

O `root.hcl` aponta os endpoints dos serviços emulados para o Floci. O que o
emulador não implementa fica de fora, e a fundação é quase toda assim:
`CreateOrganization`, `CreateAccount` e `CreatePolicy` não são emulados. Fundação
se prova na Organization de ensaio, não no contêiner.

## Erros que você vai encontrar

| O que aparece | O que é |
|---|---|
| `Invalid value for input variable` num `PREENCHER` | o tipo declarado em `variables.tf` não é string. Veja o passo 1. |
| `has no outputs, but mock outputs provided` | a célula de cima ainda não subiu. Normal antes do primeiro apply, erro depois dele. |
| `AccessDeniedException ... ListEnabledBaselines` | a credencial não vê o Control Tower. O gate da fundação não roda sem isso. |
| `bioma.sh` termina sem imprimir receita | os caminhos das fases não existem na árvore gerada. Use `--area live/<caminho>`. |
| `Error acquiring the state lock` | outra execução ficou pela metade. Confira quem está rodando antes de forçar. |
