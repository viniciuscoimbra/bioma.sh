## Why

O catálogo tem a fundação inteira escrita à mão e validada: `organizacao`,
`arvore-ous`, `conta-governada`, `politicas-scp`, `delegated-admins`,
`identity-center`, `backup-organizacional`, mais as moléculas `conta`,
`ou-registrada` e `scp`. O gerador não usa nada disso. Ele escreve átomo cru por
cima do mesmo caminho.

Rodado em 2026-08-10 contra uma proposta com três peças de fundação
(`AWS Organizations`, `AWS Organizations OU`, `AWS Organizations Account`), o
`gerar_iac.py` escreveu 16 arquivos com quatro defeitos:

- **Três `aws_organizations_organization` na mesma árvore.** A AWS tem uma
  Organization por conta de gerência. Duas dessas falham no apply.
- **Nenhum `aws_organizations_account`.** A peça chamada Account virou
  `aws_organizations_organizational_unit` com `parent_id = "PREENCHER"`. Não
  existe caminho do desenho até a criação de conta.
- **A Organization saiu com corpo vazio.** Sem `feature_set`, sem
  `enabled_policy_types`, sem `prevent_destroy`. Aplicar isso cria uma
  Organization sem SCP habilitada e sem trava contra destruição, e o
  `catalogo/organismos/fundacao/organizacao/main.tf` do repositório tem as três
  coisas.
- **O stub sobrescreve a receita boa.** O gerado ocupa
  `catalogo/organismos/fundacao/organizacao/main.tf` na árvore de saída, que é o
  mesmo caminho do arquivo escrito à mão, e não o reaproveita.

É o modo de falha que o AGENTS.md nomeia: recurso escolhido por semelhança de
nome passa no lint e quebra no apply. Duas tabelas já discordam entre si sobre o
mesmo termo. `ferramentas/ler_diagrama.py:112` e `:195` mapeiam `organizations`
para `aws_organizations_organization`; `tela/icones-aws.json:340` mapeia o mesmo
termo para `aws_organizations_account`.

Nada disso aparece nos portões, porque `testes/arvore-esperada` tem 36 arquivos e
nenhuma célula de fundação, e `exemplos/` não tem entrada que descreva
Organization, OU ou conta.

## What Changes

- A fundação ganha tabela própria, escrita à mão, que separa Organization, OU e
  conta. Termo de fundação que a tabela não conhece para de virar recurso e passa
  a sair pendente com a razão escrita.
- O gerador passa a **compor o organismo do catálogo** quando a peça é de
  fundação, em vez de escrever átomo. A célula Terragrunt aponta para a receita
  que já existe e foi validada.
- A árvore recusa a segunda Organization no mesmo desenho, nomeando as duas peças
  que colidem, em vez de escrever as duas e deixar o apply descobrir.
- Um exemplo de fundação entra em `exemplos/`, e as células correspondentes
  entram em `testes/arvore-esperada`, no mesmo commit.

## Capabilities

### New Capabilities

- `fundacao-gerada`: o que a ferramenta garante ao traduzir desenho de fundação
  em árvore.

## Impact

**Quebra quem gerou árvore de fundação com o comportamento atual.** A saída
muda de átomo cru para chamada ao organismo do catálogo, então o
`terragrunt.hcl` aponta para outro `source` e os inputs mudam de nome. Quem
aplicou o stub tem uma Organization sem `prevent_destroy` e sem tipos de
política habilitados, e migrar exige `terraform import` ou apply com o estado
conferido à mão. A change não migra ninguém automaticamente.

`testes/arvore-esperada` cresce com as células de fundação, e os portões passam
a cobrir um caminho que hoje não cobrem.

`landing-zone` fica **fora**. Ela é a segunda unidade da fase 2 em
`bioma.sh:447` e está `planejada (contrato definido; interior por construir)`,
esperando a escolha entre o módulo da Gruntwork e o `mcaf-landing-zone`. Isso é
código de terceiro e decisão humana. Enquanto não houver decisão, a árvore
gerada traz `00-organizacao`, `02-ous`, `03-scp` e `04-contas`, e diz por
escrito que `01-landing-zone` está vazia e para a fase.

A tabela de `tela/icones-aws.json` e a de `ferramentas/ler_diagrama.py` passam a
concordar, e a divergência atual vira caso de teste.
